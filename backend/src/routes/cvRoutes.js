const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadAndParseCV } = require('../controllers/cvController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, 'cv-' + uniqueSuffix + fileExtension);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  fileFilter: function (req, file, cb) {
    // Only accept PDF files
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'), false);
    }
    cb(null, true);
  }
});

// Route for uploading and parsing a CV
router.post('/upload', upload.single('cv'), uploadAndParseCV);

// Route for AI expansion of selected experiences
router.post('/expand', async (req, res) => {
  try {
    const { experiences } = req.body;
    const { generateExpandedDescription } = require('../services/cvParsingService');
    if (!Array.isArray(experiences) || experiences.length === 0) {
      return res.status(400).json({ success: false, message: 'No experiences provided' });
    }
    const expansions = await Promise.all(
      experiences.map(exp => generateExpandedDescription(exp))
    );
    res.json({ success: true, expansions });
  } catch (error) {
    console.error('Error expanding experiences:', error);
    res.status(500).json({ success: false, message: 'AI expansion failed', error: error.message });
  }
});

module.exports = router; 