const multer = require('multer');

// Use memoryStorage so uploaded images are saved persistently as Base64 Data URIs in MongoDB
// instead of ephemeral local disk storage (which resets on Render/cloud restarts).
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedMime = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
  ];

  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WEBP, SVG, GIF) are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per image (safe for MongoDB 16MB doc limit)
  fileFilter,
});

module.exports = upload;
