const express = require('express');
const { Op, fn, col, literal } = require('sequelize');
const { Book, Purchase } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/analytics/dashboard
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total stats
    const [
      totalBooks,
      totalSales,
      totalRevenue,
      totalDownloads,
      monthSales,
      lastMonthSales,
      monthRevenue,
      lastMonthRevenue,
      recentPurchases,
      topBooks,
    ] = await Promise.all([
      Book.count({ where: { isPublished: true } }),

      Purchase.count({ where: { status: 'success' } }),

      Purchase.sum('amount', { where: { status: 'success' } }),

      Book.sum('downloadCount'),

      Purchase.count({
        where: { status: 'success', createdAt: { [Op.gte]: startOfMonth } },
      }),

      Purchase.count({
        where: {
          status: 'success',
          createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] },
        },
      }),

      Purchase.sum('amount', {
        where: { status: 'success', createdAt: { [Op.gte]: startOfMonth } },
      }),

      Purchase.sum('amount', {
        where: {
          status: 'success',
          createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] },
        },
      }),

      Purchase.findAll({
        where: { status: 'success' },
        include: [{ model: Book, as: 'book', attributes: ['title', 'coverImage'] }],
        order: [['createdAt', 'DESC']],
        limit: 10,
      }),

      Book.findAll({
        where: { isPublished: true },
        order: [['salesCount', 'DESC']],
        limit: 5,
        attributes: ['id', 'title', 'author', 'coverImage', 'price', 'salesCount', 'downloadCount', 'totalRevenue'],
      }),
    ]);

    // Sales trend (last 7 days)
    const salesTrend = await Purchase.findAll({
      where: {
        status: 'success',
        createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'sales'],
        [fn('SUM', col('amount')), 'revenue'],
      ],
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true,
    });

    // Revenue by genre
    const revenueByGenre = await Purchase.findAll({
      where: { status: 'success' },
      include: [{ model: Book, as: 'book', attributes: ['genre'] }],
      attributes: [[fn('SUM', col('Purchase.amount')), 'revenue']],
      group: ['book.genre'],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalBooks,
          totalSales: totalSales || 0,
          totalRevenue: parseFloat(totalRevenue || 0).toFixed(2),
          totalDownloads: totalDownloads || 0,
          monthSales: monthSales || 0,
          lastMonthSales: lastMonthSales || 0,
          monthRevenue: parseFloat(monthRevenue || 0).toFixed(2),
          lastMonthRevenue: parseFloat(lastMonthRevenue || 0).toFixed(2),
        },
        salesTrend,
        topBooks,
        recentPurchases,
        revenueByGenre,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/analytics/sales-chart?period=30
router.get('/sales-chart', authenticate, async (req, res) => {
  try {
    const days = parseInt(req.query.period) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const data = await Purchase.findAll({
      where: { status: 'success', createdAt: { [Op.gte]: startDate } },
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'sales'],
        [fn('SUM', col('amount')), 'revenue'],
      ],
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true,
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
