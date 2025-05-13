/**
 * Routes for Personal Statement
 */
const express = require('express');
const router = express.Router();
const personalStatementController = require('../controllers/personalStatementController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Get user's personal statement
router.get('/', personalStatementController.getPersonalStatement);

// Save/update personal statement
router.post('/', personalStatementController.savePersonalStatement);

// Generate thesis statements
router.post('/generate-thesis', personalStatementController.generateThesisStatements);

// Save selected thesis statement
router.put('/select-thesis', personalStatementController.saveSelectedThesis);

// Generate final statement
router.post('/generate-final', personalStatementController.generateFinalStatement);

// Save final statement (if user wants to edit the generated one)
router.put('/save-final', personalStatementController.saveFinalStatement);

// Download personal statement as PDF
router.get('/download-pdf', personalStatementController.downloadPersonalStatementPDF);

// Direct completion endpoint - use this to ensure completion is registered
router.post('/complete', personalStatementController.completePersonalStatement);

// Get personal statement
router.get('/', protect, (req, res) => {
  console.log('Get personal statement request received');
  
  res.status(200).json({
    success: true,
    data: {
      personalStatement: {
        content: '',
        isComplete: false,
        lastUpdated: new Date().toISOString()
      }
    }
  });
});

// Save personal statement
router.post('/', protect, (req, res) => {
  const { content } = req.body;
  console.log('Save personal statement request received, length:', content?.length || 0);
  
  res.status(200).json({
    success: true,
    message: 'Personal statement saved successfully',
    data: {
      personalStatement: {
        content: content || '',
        isComplete: !!content,
        lastUpdated: new Date().toISOString()
      }
    }
  });
});

// Mark personal statement as complete
router.post('/complete', protect, (req, res) => {
  console.log('Mark personal statement complete request received');
  
  res.status(200).json({
    success: true,
    message: 'Personal statement marked as complete',
    data: {
      isComplete: true,
      lastUpdated: new Date().toISOString()
    }
  });
});

// Generate personal statement with AI
router.post('/generate', protect, (req, res) => {
  const { prompt } = req.body;
  console.log('Generate personal statement request received with prompt:', prompt);
  
  // Return a mock generated statement for development
  res.status(200).json({
    success: true,
    message: 'Personal statement generated successfully',
    data: {
      generatedContent: "This is a mock personal statement generated for development purposes. In a real implementation, this would be generated using OpenAI or similar AI service based on the user's provided details and prompts."
    }
  });
});

module.exports = router; 