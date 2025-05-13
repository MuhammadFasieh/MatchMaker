const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Get user profile
router.get('/', protect, (req, res) => {
  console.log('Profile request received');
  
  // Return mock profile data for development
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.userId || '123456789',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        specialty: 'Internal Medicine',
        bio: 'A dedicated medical professional',
        location: 'New York, NY',
        skills: ['Patient Care', 'Research', 'Leadership'],
        interests: ['Cardiology', 'Oncology']
      }
    }
  });
});

// Update user profile
router.put('/', protect, (req, res) => {
  const profileData = req.body;
  console.log('Update profile request received:', profileData);
  
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: req.userId || '123456789',
        ...profileData
      }
    }
  });
});

// Upload profile image
router.post('/upload-image', protect, (req, res) => {
  console.log('Upload profile image request received');
  
  res.status(200).json({
    success: true,
    message: 'Profile image uploaded successfully',
    data: {
      imageUrl: 'https://example.com/placeholder-profile.jpg'
    }
  });
});

module.exports = router; 