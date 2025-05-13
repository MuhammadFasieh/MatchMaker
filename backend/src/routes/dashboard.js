const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Get dashboard data
router.get('/', protect, (req, res) => {
  console.log('Dashboard request received');
  
  res.status(200).json({
    success: true,
    data: {
      sections: {
        personalStatement: { complete: false, percentage: 0 },
        experiences: { complete: false, percentage: 0 },
        researchProducts: { complete: false, percentage: 0 },
        miscellaneousQuestions: { complete: false, percentage: 0 },
        programPreferences: { complete: false, percentage: 0 }
      },
      overall: {
        complete: false,
        percentage: 0
      }
    }
  });
});

// Check application completeness
router.get('/check-readiness', protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      isComplete: false,
      missingItems: [
        'Personal statement',
        'Meaningful experiences',
        'Research products',
        'Miscellaneous questions'
      ]
    }
  });
});

// Mark section as complete
router.put('/:section', protect, (req, res) => {
  const { section } = req.params;
  const { isComplete } = req.body;
  
  console.log(`Updating section ${section}: ${isComplete ? 'Complete' : 'Incomplete'}`);
  
  res.status(200).json({
    success: true,
    message: `${section} marked as ${isComplete ? 'complete' : 'incomplete'}`
  });
});

module.exports = router; 