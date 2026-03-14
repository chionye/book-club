const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { Book, Purchase } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// POST /api/payments/initialize - Initialize payment
router.post('/initialize', [
  body('bookId').notEmpty(),
  body('buyerName').notEmpty().trim(),
  body('buyerEmail').isEmail().normalizeEmail(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { bookId, buyerName, buyerEmail } = req.body;

    const book = await Book.findOne({ where: { id: bookId, isPublished: true } });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    if (!book.isPaid) {
      return res.status(400).json({ success: false, message: 'This book is free. No payment required.' });
    }

    const reference = `MATTY_${uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase()}`;
    const amountInKobo = Math.round(book.price * 100);

    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: buyerEmail,
        amount: amountInKobo,
        reference,
        metadata: {
          bookId: book.id,
          bookTitle: book.title,
          buyerName,
          custom_fields: [
            { display_name: 'Book', variable_name: 'book', value: book.title },
            { display_name: 'Buyer', variable_name: 'buyer', value: buyerName },
          ],
        },
        callback_url: `${process.env.FRONTEND_URL}/payment/verify?ref=${reference}`,
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    const purchase = await Purchase.create({
      bookId: book.id,
      buyerName,
      buyerEmail,
      amount: book.price,
      currency: 'NGN',
      paystackReference: reference,
      paystackAccessCode: paystackRes.data.data.access_code,
      status: 'pending',
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      data: {
        authorizationUrl: paystackRes.data.data.authorization_url,
        reference,
        accessCode: paystackRes.data.data.access_code,
        purchaseId: purchase.id,
      },
    });
  } catch (error) {
    console.error('Payment initialize error:', error?.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to initialize payment' });
  }
});

// GET /api/payments/verify/:reference
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    const purchase = await Purchase.findOne({
      where: { paystackReference: reference },
      include: [{ model: Book, as: 'book' }],
    });

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (purchase.status === 'success') {
      return res.json({
        success: true,
        data: {
          status: 'success',
          downloadToken: purchase.downloadToken,
          book: { id: purchase.book.id, title: purchase.book.title },
        },
      });
    }

    // Verify with Paystack
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    const txn = paystackRes.data.data;

    if (txn.status === 'success') {
      const downloadToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000 * 7); // 7 days

      await purchase.update({
        status: 'success',
        downloadToken,
        downloadTokenExpiry: tokenExpiry,
        metadata: { paystackData: txn },
      });

      // Update book stats
      await purchase.book.increment(['salesCount', 'downloadCount']);
      await purchase.book.increment('totalRevenue', { by: parseFloat(purchase.amount) });

      return res.json({
        success: true,
        data: {
          status: 'success',
          downloadToken,
          book: { id: purchase.book.id, title: purchase.book.title },
        },
      });
    }

    await purchase.update({ status: txn.status === 'failed' ? 'failed' : 'pending' });

    res.json({ success: true, data: { status: txn.status } });
  } catch (error) {
    console.error('Payment verify error:', error?.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
});

// POST /api/payments/webhook - Paystack webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET)
      .update(req.body)
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = JSON.parse(req.body);

    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const purchase = await Purchase.findOne({
        where: { paystackReference: reference, status: 'pending' },
        include: [{ model: Book, as: 'book' }],
      });

      if (purchase) {
        const downloadToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000 * 7);

        await purchase.update({
          status: 'success',
          downloadToken,
          downloadTokenExpiry: tokenExpiry,
          metadata: { paystackData: event.data },
        });

        await purchase.book.increment('salesCount');
        await purchase.book.increment('totalRevenue', { by: parseFloat(purchase.amount) });
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

// GET /api/payments/admin/transactions
router.get('/admin/transactions', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const { Op } = require('sequelize');
    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { buyerEmail: { [Op.like]: `%${search}%` } },
        { buyerName: { [Op.like]: `%${search}%` } },
        { paystackReference: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Purchase.findAndCountAll({
      where,
      include: [{ model: Book, as: 'book', attributes: ['id', 'title', 'author'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        transactions: rows,
        pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
