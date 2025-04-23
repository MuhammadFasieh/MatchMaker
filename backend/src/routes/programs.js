const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const { protect, authorize } = require('../middleware/auth');
const applicationRouter = require('./applications');

// Re-route into other resource routers
router.use('/:programId/applications', applicationRouter);

// Routes
router
  .route('/')
  .get(programController.getPrograms)
  .post(
    protect,
    authorize('admin', 'program_manager'),
    programController.createProgram
  );

router
  .route('/:id')
  .get(programController.getProgram)
  .put(
    protect,
    authorize('admin', 'program_manager'),
    programController.updateProgram
  )
  .delete(
    protect,
    authorize('admin'),
    programController.deleteProgram
  );

// Search programs
router.get('/search', programController.searchPrograms);

// Featured programs
router.get('/featured', programController.getFeaturedPrograms);

// Save program to user's saved list
router.put(
  '/:id/save',
  protect,
  programController.saveProgram
);

// Remove program from user's saved list
router.delete(
  '/:id/save',
  protect,
  programController.unsaveProgram
);

// Get user's saved programs
router.get(
  '/saved',
  protect,
  programController.getSavedPrograms
);

module.exports = router; 