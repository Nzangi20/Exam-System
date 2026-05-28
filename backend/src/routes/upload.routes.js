const express = require('express');
const upload = require('../middleware/upload.middleware');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Construct URL to access the file
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.status(200).json({
    message: 'File uploaded successfully',
    url: fileUrl,
    filename: req.file.filename,
  });
});

module.exports = router;
