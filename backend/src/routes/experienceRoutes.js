const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experienceController');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Get all experiences
router.get('/', protect, experienceController.getExperiences);

// Parse CV to extract experiences
router.post('/parse-cv', protect, uploadSingle('cv'), experienceController.parseCV);

// Add a new experience
router.post('/', protect, experienceController.addExperience);

// Bulk save experiences
router.post('/bulk', protect, experienceController.saveMultipleExperiences);

// Update an experience
router.put('/:id', protect, experienceController.updateExperience);

// Delete an experience
router.delete('/:id', protect, experienceController.deleteExperience);

// Mark experience as most meaningful (existing route still available)
router.put('/meaningful/set', protect, experienceController.setMostMeaningful);

// Mark individual experience as most meaningful (to match frontend API call)
router.put('/:id/most-meaningful', protect, experienceController.markAsMostMeaningful);

// Generate expanded description for a most meaningful experience
router.post('/:id/expand', protect, experienceController.generateExpandedDescription);

module.exports = router; 