const express = require('express');
const router = express.Router();
const researchController = require('../controllers/researchController');
const authenticate = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Get all research products
router.get('/', authenticate, researchController.getResearchProducts);

// Parse CV to extract research products
router.post('/parse-cv', authenticate, uploadSingle('cv'), researchController.parseCV);

// Add a new research product
router.post('/', authenticate, researchController.addResearchProduct);

// Update a research product
router.put('/:id', authenticate, researchController.updateResearchProduct);

// Delete a research product
router.delete('/:id', authenticate, researchController.deleteResearchProduct);

module.exports = router; 