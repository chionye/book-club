const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const bookStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/books');
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `book_${uuidv4()}${ext}`);
  },
});

const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/covers');
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `cover_${uuidv4()}${ext}`);
  },
});

const bookFileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.epub', '.mobi', '.txt', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, EPUB, MOBI, TXT, DOC, DOCX files are allowed'), false);
  }
};

const coverFileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, WEBP images are allowed'), false);
  }
};

const uploadBook = multer({
  storage: bookStorage,
  fileFilter: bookFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

const uploadCover = multer({
  storage: coverStorage,
  fileFilter: coverFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadBookWithCover = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadPath;
      if (file.fieldname === 'bookFile') {
        uploadPath = path.join(__dirname, '../../uploads/books');
      } else {
        uploadPath = path.join(__dirname, '../../uploads/covers');
      }
      ensureDir(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const prefix = file.fieldname === 'bookFile' ? 'book' : 'cover';
      cb(null, `${prefix}_${uuidv4()}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'bookFile') {
      bookFileFilter(req, file, cb);
    } else {
      coverFileFilter(req, file, cb);
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 },
});

module.exports = { uploadBook, uploadCover, uploadBookWithCover };
