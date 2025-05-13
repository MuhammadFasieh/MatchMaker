const express = require('express');
const router = express.Router();
const researchController = require('../controllers/researchController');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Get all research products
router.get('/', protect, (req, res) => {
  console.log('Get all research products request received');
  
  res.status(200).json({
    success: true,
    data: {
      researchProducts: []
    }
  });
});

// Get single research product
router.get('/:id', protect, (req, res) => {
  const { id } = req.params;
  console.log(`Get research product ${id} request received`);
  
  res.status(200).json({
    success: true,
    data: {
      researchProduct: {
        id,
        title: 'Example Research Paper',
        type: 'Publication',
        authors: 'User, Test',
        journal: 'Journal of Medical Research',
        year: '2023',
        citation: 'User, T. (2023). Example Research Paper. Journal of Medical Research, 45(2), 123-145.'
      }
    }
  });
});

// Create research product
router.post('/', protect, (req, res) => {
  const researchData = req.body;
  console.log('Create research product request received:', researchData);
  
  res.status(201).json({
    success: true,
    message: 'Research product created successfully',
    data: {
      researchProduct: {
        id: 'research-' + Date.now(),
        ...researchData,
        createdAt: new Date().toISOString()
      }
    }
  });
});

// Update research product
router.put('/:id', protect, (req, res) => {
  const { id } = req.params;
  const researchData = req.body;
  console.log(`Update research product ${id} request received:`, researchData);
  
  res.status(200).json({
    success: true,
    message: 'Research product updated successfully',
    data: {
      researchProduct: {
        id,
        ...researchData,
        updatedAt: new Date().toISOString()
      }
    }
  });
});

// Delete research product
router.delete('/:id', protect, (req, res) => {
  const { id } = req.params;
  console.log(`Delete research product ${id} request received`);
  
  res.status(200).json({
    success: true,
    message: 'Research product deleted successfully'
  });
});

// Parse CV to extract research products
router.post('/parse-cv', protect, uploadSingle('cv'), (req, res) => {
  console.log('Parse CV for research products request received');
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No CV file provided'
    });
  }
  
  // Mock response for development
  res.status(200).json({
    success: true,
    message: 'Research products extracted from CV',
    data: {
      researchProducts: [
        {
          id: 'research-1',
          title: 'Example Research Paper 1',
          type: 'Publication',
          authors: 'User, Test',
          journal: 'Journal of Medical Research',
          year: '2023',
          citation: 'User, T. (2023). Example Research Paper 1. Journal of Medical Research, 45(2), 123-145.'
        },
        {
          id: 'research-2',
          title: 'Example Research Abstract',
          type: 'Abstract',
          authors: 'User, Test; Colleague, Another',
          journal: 'Annual Medical Conference',
          year: '2022',
          citation: 'User, T., Colleague, A. (2022). Example Research Abstract. Annual Medical Conference, 78.'
        }
      ]
    }
  });
});

module.exports = router; 