const express = require('express');
const router = express.Router();
const personalStatementController = require('../controllers/personalStatementController');
const authenticate = require('../middleware/auth');

// Get personal statement data
router.get('/', authenticate, personalStatementController.getPersonalStatement);

// Save initial personal statement data
router.post('/', authenticate, personalStatementController.savePersonalStatementData);

// Generate thesis statements
router.post('/generate-thesis', authenticate, personalStatementController.generateThesisStatements);

// Save selected thesis statement
router.put('/select-thesis', authenticate, personalStatementController.saveSelectedThesis);

// Generate final statement
router.post('/generate-final', authenticate, personalStatementController.generateFinalStatement);

// Save final statement (if user wants to edit the generated one)
router.put('/save-final', authenticate, personalStatementController.saveFinalStatement);

module.exports = router; 