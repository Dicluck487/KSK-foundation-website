// middleware/upload.js
// Parses multipart form uploads into memory (buffer), so controllers can
// push the bytes straight to Supabase Storage without touching local disk.
const multer = require('multer');

const storage = multer.memoryStorage();

const imageUpload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype);
    cb(ok ? null : new Error('Only JPG, PNG, WEBP or GIF images are allowed'), ok);
  },
});

const publicationUpload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB (covers + PDFs)
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.mimetype);
    cb(ok ? null : new Error('Only JPG/PNG (cover) or PDF files are allowed'), ok);
  },
});

module.exports = { imageUpload, publicationUpload };
