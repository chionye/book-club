const express = require('express');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { body, query, validationResult } = require('express-validator');
const { Book, Purchase } = require('../models');
const { authenticate } = require('../middleware/auth');
const { uploadBookWithCover } = require('../middleware/upload');

const router = express.Router();

// GET /api/books - Public: list published books
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, genre, search, sort = 'createdAt' } = req.query;
    const offset = (page - 1) * limit;

    const where = { isPublished: true };
    if (genre) where.genre = genre;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const order = sort === 'price' ? [['price', 'ASC']]
      : sort === 'popular' ? [['downloadCount', 'DESC']]
      : sort === 'sales' ? [['salesCount', 'DESC']]
      : [['createdAt', 'DESC']];

    const { count, rows } = await Book.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['filePath', 'fileName'] },
    });

    res.json({
      success: true,
      data: {
        books: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/books/genres - Public: get all genres
router.get('/genres', async (req, res) => {
  try {
    const genres = await Book.findAll({
      where: { isPublished: true, genre: { [Op.ne]: null } },
      attributes: ['genre'],
      group: ['genre'],
      raw: true,
    });
    res.json({ success: true, data: genres.map(g => g.genre) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/books/:id - Public: get single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findOne({
      where: { id: req.params.id, isPublished: true },
      attributes: { exclude: ['filePath', 'fileName'] },
    });

    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    res.json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ ADMIN ROUTES ============

// GET /api/books/admin/all
router.get('/admin/all', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, genre, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } },
      ];
    }
    if (genre) where.genre = genre;
    if (status === 'published') where.isPublished = true;
    if (status === 'unpublished') where.isPublished = false;

    const { count, rows } = await Book.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        books: rows,
        pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/books/admin - Upload new book
router.post('/admin', authenticate, uploadBookWithCover.fields([
  { name: 'bookFile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]), async (req, res) => {
  try {
    const { title, author, description, genre, price, isPaid, isPublished, isPremium, pages, language, isbn, previewText, tags } = req.body;

    if (!req.files?.bookFile) {
      return res.status(400).json({ success: false, message: 'Book file is required' });
    }

    const bookFile = req.files.bookFile[0];
    const coverFile = req.files?.coverImage?.[0];

    const book = await Book.create({
      title,
      author,
      description,
      genre,
      price: parseFloat(price) || 0,
      isPaid: isPaid === 'true' || isPaid === true,
      isPublished: isPublished !== 'false' && isPublished !== false,
      isPremium: isPremium === 'true' || isPremium === true,
      filePath: bookFile.path,
      fileName: bookFile.originalname,
      fileSize: bookFile.size,
      fileType: path.extname(bookFile.originalname).substring(1).toUpperCase(),
      coverImage: coverFile ? `/uploads/covers/${coverFile.filename}` : null,
      pages: pages ? parseInt(pages) : null,
      language: language || 'English',
      isbn,
      previewText,
      tags: tags ? JSON.parse(tags) : [],
    });

    res.status(201).json({ success: true, message: 'Book uploaded successfully', data: book });
  } catch (error) {
    console.error('Upload book error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/books/admin/:id - Update book
router.put('/admin/:id', authenticate, uploadBookWithCover.fields([
  { name: 'bookFile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]), async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    const { title, author, description, genre, price, isPaid, isPublished, isPremium, pages, language, isbn, previewText, tags } = req.body;

    const updates = {
      title: title || book.title,
      author: author || book.author,
      description,
      genre,
      price: price !== undefined ? parseFloat(price) : book.price,
      isPaid: isPaid !== undefined ? (isPaid === 'true' || isPaid === true) : book.isPaid,
      isPublished: isPublished !== undefined ? (isPublished !== 'false' && isPublished !== false) : book.isPublished,
      isPremium: isPremium !== undefined ? (isPremium === 'true' || isPremium === true) : book.isPremium,
      pages: pages ? parseInt(pages) : book.pages,
      language: language || book.language,
      isbn: isbn || book.isbn,
      previewText: previewText || book.previewText,
      tags: tags ? JSON.parse(tags) : book.tags,
    };

    if (req.files?.bookFile) {
      // Delete old file
      if (fs.existsSync(book.filePath)) fs.unlinkSync(book.filePath);
      const bookFile = req.files.bookFile[0];
      updates.filePath = bookFile.path;
      updates.fileName = bookFile.originalname;
      updates.fileSize = bookFile.size;
      updates.fileType = path.extname(bookFile.originalname).substring(1).toUpperCase();
    }

    if (req.files?.coverImage) {
      // Delete old cover
      if (book.coverImage) {
        const oldCoverPath = path.join(__dirname, '../../', book.coverImage);
        if (fs.existsSync(oldCoverPath)) fs.unlinkSync(oldCoverPath);
      }
      const coverFile = req.files.coverImage[0];
      updates.coverImage = `/uploads/covers/${coverFile.filename}`;
    }

    await book.update(updates);
    res.json({ success: true, message: 'Book updated successfully', data: book });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/books/admin/:id
router.delete('/admin/:id', authenticate, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    // Delete physical files
    if (book.filePath && fs.existsSync(book.filePath)) fs.unlinkSync(book.filePath);
    if (book.coverImage) {
      const coverPath = path.join(__dirname, '../../', book.coverImage);
      if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
    }

    await book.destroy();
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/books/admin/:id
router.get('/admin/:id', authenticate, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
