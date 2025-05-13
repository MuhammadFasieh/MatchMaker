const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Get all applications
router.get('/', protect, (req, res) => {
  console.log('Get all applications request received');
  
  res.status(200).json({
    success: true,
    data: {
      applications: [
        {
          id: 'app1',
          program: 'Internal Medicine Residency',
          institution: 'Mayo Clinic',
          status: 'Draft',
          deadline: '2023-12-01'
        },
        {
          id: 'app2',
          program: 'Cardiology Fellowship',
          institution: 'Johns Hopkins',
          status: 'Submitted',
          deadline: '2023-11-15'
        }
      ]
    }
  });
});

// Get single application
router.get('/:id', protect, (req, res) => {
  const { id } = req.params;
  console.log(`Get application ${id} request received`);
  
  res.status(200).json({
    success: true,
    data: {
      application: {
        id,
        program: 'Internal Medicine Residency',
        institution: 'Mayo Clinic',
        status: 'Draft',
        deadline: '2023-12-01',
        sections: {
          personalStatement: true,
          experiences: true,
          research: false,
          miscQuestions: false
        }
      }
    }
  });
});

// Create application
router.post('/', protect, (req, res) => {
  const applicationData = req.body;
  console.log('Create application request received:', applicationData);
  
  res.status(201).json({
    success: true,
    message: 'Application created successfully',
    data: {
      application: {
        id: 'new-app-' + Date.now(),
        ...applicationData,
        status: 'Draft',
        createdAt: new Date().toISOString()
      }
    }
  });
});

// Update application
router.put('/:id', protect, (req, res) => {
  const { id } = req.params;
  const applicationData = req.body;
  console.log(`Update application ${id} request received:`, applicationData);
  
  res.status(200).json({
    success: true,
    message: 'Application updated successfully',
    data: {
      application: {
        id,
        ...applicationData,
        updatedAt: new Date().toISOString()
      }
    }
  });
});

// Submit application
router.put('/:id/submit', protect, (req, res) => {
  const { id } = req.params;
  console.log(`Submit application ${id} request received`);
  
  res.status(200).json({
    success: true,
    message: 'Application submitted successfully',
    data: {
      application: {
        id,
        status: 'Submitted',
        submittedAt: new Date().toISOString()
      }
    }
  });
});

module.exports = router; 