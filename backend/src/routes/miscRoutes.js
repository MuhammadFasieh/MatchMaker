const express = require('express');
const router = express.Router();
const miscController = require('../controllers/miscController');
const authenticate = require('../middleware/auth');

// Get miscellaneous questions data
router.get('/', authenticate, miscController.getMiscData);

// Save professionalism issues
router.put('/professionalism', authenticate, miscController.saveProfessionalism);

// Save education information
router.put('/education', authenticate, miscController.saveEducation);

// Add honor/award
router.post('/honors', authenticate, miscController.addHonorAward);

// Update honor/award
router.put('/honors/:id', authenticate, miscController.updateHonorAward);

// Delete honor/award
router.delete('/honors/:id', authenticate, miscController.deleteHonorAward);

// Save impactful experience and hobbies
router.put('/impactful-hobbies', authenticate, miscController.saveImpactfulAndHobbies);

// Save all miscellaneous data at once
router.post('/', authenticate, miscController.saveAllMiscData);

module.exports = router; 