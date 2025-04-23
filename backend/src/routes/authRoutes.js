const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const { uploadFields } = require('../middleware/upload');

// Register new user
router.post('/register', 
  uploadFields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'cv', maxCount: 1 }
  ]), 
  (req, res) => authController.register(req, res)
);

// Login user
router.post('/login', authController.login);

// Protected routes (require authentication)
router.get('/profile', authenticate.protect, authController.getProfile);
router.put('/profile', authenticate.protect, authController.updateProfile);
router.post('/upload-profile-image', authenticate.protect, uploadFields([{ name: 'profileImage', maxCount: 1 }]), (req, res) => authController.uploadProfileImage(req, res));
router.post('/upload-cv', authenticate.protect, uploadFields([{ name: 'cv', maxCount: 1 }]), (req, res) => authController.uploadCV(req, res));

module.exports = router; 