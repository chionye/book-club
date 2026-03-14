const express = require('express');
const path = require('path');
const fs = require('fs');
const { Purchase, Book } = require('../models');

const router = express.Router();

// GET /api/downloads/:token - Download book with token
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const purchase = await Purchase.findOne({
      where: { downloadToken: token, status: 'success' },
      include: [{ model: Book, as: 'book' }],
    });

    if (!purchase) {
      return res.status(404).sendFile(path.join(__dirname, '../../public/invalid-token.html'), (err) => {
        if (err) res.status(404).json({ success: false, message: 'Invalid or expired download link' });
      });
    }

    // Check token expiry
    if (purchase.downloadTokenExpiry && new Date() > purchase.downloadTokenExpiry) {
      return res.status(410).json({ success: false, message: 'Download link has expired' });
    }

    // Check download count limit
    if (purchase.downloadCount >= purchase.maxDownloads) {
      return res.status(429).json({ success: false, message: 'Maximum download limit reached' });
    }

    const book = purchase.book;

    // Check file exists
    if (!fs.existsSync(book.filePath)) {
      return res.status(404).json({ success: false, message: 'Book file not found on server' });
    }

    // Increment download count
    await purchase.increment('downloadCount');
    await book.increment('downloadCount');

    const ext = path.extname(book.filePath);
    const safeTitle = book.title.replace(/[^a-z0-9]/gi, '_');
    const downloadName = `${safeTitle}${ext}`;

    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('X-Download-Count', purchase.downloadCount + 1);

    const fileStream = fs.createReadStream(book.filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error streaming file' });
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/downloads/free/:bookId - Free book download
router.get('/free/:bookId', async (req, res) => {
  try {
    const book = await Book.findOne({
      where: { id: req.params.bookId, isPublished: true, isPaid: false },
    });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found or not free' });
    }

    if (!fs.existsSync(book.filePath)) {
      return res.status(404).json({ success: false, message: 'Book file not found' });
    }

    await book.increment('downloadCount');

    const ext = path.extname(book.filePath);
    const safeTitle = book.title.replace(/[^a-z0-9]/gi, '_');
    const downloadName = `${safeTitle}${ext}`;

    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    const fileStream = fs.createReadStream(book.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Free download error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
