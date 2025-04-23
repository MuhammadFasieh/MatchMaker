const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experienceController');
const authenticate = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Get all experiences
router.get('/', authenticate, experienceController.getExperiences);

// Parse CV to extract experiences
router.post('/parse-cv', authenticate, uploadSingle('cv'), experienceController.parseCV);

// Add a new experience
router.post('/', authenticate, experienceController.addExperience);

// Update an experience
router.put('/:id', authenticate, experienceController.updateExperience);

// Delete an experience
router.delete('/:id', authenticate, experienceController.deleteExperience);

// Mark experiences as most meaningful
router.put('/meaningful/set', authenticate, experienceController.setMostMeaningful);

// Generate expanded description for a most meaningful experience
router.post('/:id/expand', authenticate, experienceController.generateExpandedDescription);

module.exports = router; 