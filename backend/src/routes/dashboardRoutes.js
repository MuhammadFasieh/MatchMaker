const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');

// Get dashboard data
router.get('/', authenticate, dashboardController.getDashboardData);

// Check if application is ready for program recommendations
router.get('/check-readiness', authenticate, dashboardController.checkApplicationReadiness);

module.exports = router; 