const express = require('express');
const router = express.Router();
const researchController = require('../controllers/researchController');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Get all research products
router.get('/', protect, researchController.getResearchProducts);

// Parse CV to extract research products
router.post('/parse-cv', protect, uploadSingle('cv'), researchController.parseCV);

// Add a new research product
router.post('/', protect, researchController.addResearchProduct);

// Update a research product
router.put('/:id', protect, researchController.updateResearchProduct);

// Delete a research product
router.delete('/:id', protect, researchController.deleteResearchProduct);

module.exports = router; 