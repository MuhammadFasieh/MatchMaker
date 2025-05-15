const Experience = require('../models/Experience');
const User = require('../models/User');
const PersonalStatement = require('../models/PersonalStatement');
const ResearchProduct = require('../models/ResearchProduct');
const MiscellaneousQuestion = require('../models/MiscellaneousQuestion');
const ProgramPreference = require('../models/ProgramPreference');
const { extractExperiences, generateExpandedDescription } = require('../services/cvParsingService');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

// Get all experiences for a user
exports.getExperiences = async (req, res) => {
  try {
    const userId = req.userId;

    // Find all experiences for the user
    const experiences = await Experience.find({ userId });

    return res.status(200).json({
      success: true,
      experiences
    });
  } catch (error) {
    console.error('Get experiences error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving experiences',
      error: error.message
    });
  }
};

// Parse CV to extract experiences
exports.parseCV = async (req, res) => {
  try {
    const userId = req.userId || (req.user && req.user._id);
    
    // Log user identification
    console.log(`CV Parsing request for user ID: ${userId ? userId : 'undefined/missing'}`);
    
    if (!userId) {
      console.error('Missing userId in request: User not properly authenticated');
      return res.status(401).json({
        success: false,
        message: 'User authentication failed - missing userId'
      });
    }

    // Check if file is provided
    if (!req.file) {
      console.error('CV Parsing: No file provided');
      return res.status(400).json({
        success: false,
        message: 'No CV file provided'
      });
    }

    console.log(`Processing CV: ${req.file.originalname}, type: ${req.file.mimetype}, size: ${req.file.size} bytes`);

    // Read the file content (if it's a PDF, we'd need to use a PDF parsing library)
    let cvText;
    try {
    if (req.file.mimetype === 'application/pdf') {
      // For this implementation, we'll assume PDF extraction is handled elsewhere
      // In a real application, you would use a library like pdf-parse
      cvText = "PDF parsing would happen here";
        console.log('PDF file detected - parsing text content');
    } else {
      // For text files
      cvText = await readFile(req.file.path, 'utf8');
        console.log(`Text file read successfully: ${cvText.substring(0, 100)}...`);
      }
    } catch (fileError) {
      console.error('Error reading CV file:', fileError);
      return res.status(500).json({
        success: false,
        message: 'Failed to read CV file',
        error: fileError.message
      });
    }

    // Extract experiences from CV text
    let extractedExperiences;
    try {
      console.log('Sending CV text to OpenAI for experience extraction...');
      extractedExperiences = await extractExperiences(cvText);
      console.log(`Successfully extracted ${extractedExperiences.length} experiences from CV`);
    } catch (extractError) {
      console.error('OpenAI API Error during extraction:', extractError);
      
      // Check for specific API errors
      let errorMessage = 'Failed to extract experiences from CV';
      if (extractError.message.includes('API key')) {
        errorMessage = 'OpenAI API key is invalid or expired';
      } else if (extractError.message.includes('rate limit')) {
        errorMessage = 'OpenAI API rate limit exceeded. Please try again later.';
      } else if (extractError.message.includes('quota')) {
        errorMessage = 'OpenAI API quota exceeded. Please check your billing information.';
      }
      
      return res.status(500).json({
        success: false,
        message: errorMessage,
        error: extractError.message
      });
    }

    // Save extracted experiences to database
    const savedExperiences = [];
    for (const exp of extractedExperiences) {
      try {
      const startDate = exp.startDate ? new Date(exp.startDate) : new Date();
      const endDate = exp.endDate && exp.endDate !== 'Current' && exp.endDate !== 'Present' ? new Date(exp.endDate) : null;
        const isCurrent = !endDate || exp.endDate === 'Current' || exp.endDate === 'Present' || exp.isCurrent === true;

      const newExperience = new Experience({
        userId,
          organization: exp.organization || 'Unknown Organization',
          experienceType: exp.experienceType || 'Work',
          positionTitle: exp.positionTitle || 'Position',
        startDate,
        endDate,
        isCurrent,
          country: exp.country || 'Unknown',
          state: exp.state || '',
          participationFrequency: exp.participationFrequency || 'Full-time',
          setting: exp.setting || 'Professional',
          focusArea: exp.focusArea || 'General',
          description: exp.description || 'Experience details not provided',
        isComplete: true
      });

      await newExperience.save();
      savedExperiences.push(newExperience);
        console.log(`Saved experience: ${newExperience.organization} - ${newExperience.positionTitle}`);
      } catch (saveError) {
        console.error('Error saving extracted experience:', saveError);
        // Continue with the next experience
      }
    }

    // Update user's application progress
    await updateUserProgress(userId);

    return res.status(200).json({
      success: true,
      message: `${savedExperiences.length} experiences extracted and saved`,
      experiences: savedExperiences
    });
  } catch (error) {
    console.error('Parse CV error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error parsing CV',
      error: error.message
    });
  }
};

// Add a single experience manually
exports.addExperience = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      organization,
      experienceType,
      positionTitle,
      startDate,
      endDate,
      isCurrent,
      country,
      state,
      participationFrequency,
      setting,
      focusArea,
      description
    } = req.body;

    // Validate required fields
    if (!organization || !experienceType || !positionTitle || !startDate || !country || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create new experience
    const experience = new Experience({
      userId,
      organization,
      experienceType,
      positionTitle,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      isCurrent: isCurrent || false,
      country,
      state,
      participationFrequency,
      setting,
      focusArea,
      description,
      isComplete: true
    });

    // Save to database
    await experience.save();

    // Update user's application progress
    await updateUserProgress(userId);

    return res.status(201).json({
      success: true,
      message: 'Experience added successfully',
      experience
    });
  } catch (error) {
    console.error('Add experience error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error adding experience',
      error: error.message
    });
  }
};

// Update an experience
exports.updateExperience = async (req, res) => {
  try {
    const userId = req.userId;
    const experienceId = req.params.id;
    const updateData = req.body;

    // Find the experience
    const experience = await Experience.findOne({ _id: experienceId, userId });
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'userId' && key !== '_id') {
        if (key === 'startDate' || key === 'endDate') {
          experience[key] = updateData[key] ? new Date(updateData[key]) : null;
        } else {
          experience[key] = updateData[key];
        }
      }
    });

    // Save updated experience
    await experience.save();

    return res.status(200).json({
      success: true,
      message: 'Experience updated successfully',
      experience
    });
  } catch (error) {
    console.error('Update experience error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating experience',
      error: error.message
    });
  }
};

// Delete an experience
exports.deleteExperience = async (req, res) => {
  try {
    const userId = req.userId;
    const experienceId = req.params.id;

    // Find and delete the experience
    const experience = await Experience.findOneAndDelete({ _id: experienceId, userId });
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    // Update user's application progress
    await updateUserProgress(userId);

    return res.status(200).json({
      success: true,
      message: 'Experience deleted successfully'
    });
  } catch (error) {
    console.error('Delete experience error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting experience',
      error: error.message
    });
  }
};

// Mark experiences as most meaningful
exports.setMostMeaningful = async (req, res) => {
  try {
    const userId = req.userId;
    const { experienceIds } = req.body;

    // Validate input
    if (!experienceIds || !Array.isArray(experienceIds)) {
      return res.status(400).json({
        success: false,
        message: 'Experience IDs must be provided as an array'
      });
    }

    // Set most meaningful experiences
    await Experience.setMostMeaningful(userId, experienceIds);

    // Get updated experiences
    const experiences = await Experience.find({ userId });

    return res.status(200).json({
      success: true,
      message: 'Most meaningful experiences updated successfully',
      experiences
    });
  } catch (error) {
    console.error('Set most meaningful error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating most meaningful experiences',
      error: error.message
    });
  }
};

// Generate expanded description for a most meaningful experience
exports.generateExpandedDescription = async (req, res) => {
  try {
    const userId = req.userId;
    const experienceId = req.params.id;

    // Find the experience
    const experience = await Experience.findOne({ _id: experienceId, userId });
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    // Check if it's marked as most meaningful
    if (!experience.isMostMeaningful) {
      return res.status(400).json({
        success: false,
        message: 'Only most meaningful experiences can have expanded descriptions'
      });
    }

    // Generate expanded description
    const expandedDescription = await generateExpandedDescription(experience);

    // Update experience with expanded description
    experience.expandedDescription = expandedDescription;
    await experience.save();

    return res.status(200).json({
      success: true,
      message: 'Expanded description generated successfully',
      expandedDescription,
      experience
    });
  } catch (error) {
    console.error('Generate expanded description error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error generating expanded description',
      error: error.message
    });
  }
};

// Update user's application progress
const updateUserProgress = async (userId) => {
  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return;
    }

    // Count experiences
    const experienceCount = await Experience.countDocuments({ userId });
    
    // Update dashboard progress
    if (!user.dashboard) {
      user.dashboard = {};
    }
    if (!user.dashboard.experiences) {
      user.dashboard.experiences = {};
    }
    
    user.dashboard.experiences.isStarted = experienceCount > 0;
    user.dashboard.experiences.isComplete = experienceCount >= 3; // Example threshold
    
    await user.save();
  } catch (error) {
    console.error('Error updating user progress:', error);
  }
};

// Save multiple experiences at once
exports.saveMultipleExperiences = async (req, res) => {
  try {
    // Get userId from either req.userId or req.user._id
    const userId = req.userId || (req.user && req.user._id);
    
    // Log user identification
    console.log(`Save Multiple Experiences request for user ID: ${userId ? userId : 'undefined/missing'}`);
    
    if (!userId) {
      console.error('Missing userId in request: User not properly authenticated');
      return res.status(401).json({
        success: false,
        message: 'User authentication failed - missing userId'
      });
    }
    
    const { experiences } = req.body;

    if (!experiences || !Array.isArray(experiences) || experiences.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No experiences provided or invalid format'
      });
    }

    // Log debugging information
    console.log(`Processing ${experiences.length} experiences for user ID: ${userId}`);
    console.log('First experience data received:', JSON.stringify(experiences[0], null, 2));
    
    const savedExperiences = [];
    const errors = [];
    
    // Create and save experiences
    for (const exp of experiences) {
      try {
        // Parse dates carefully
        let startDate = new Date();
        try {
          if (exp.startDate && exp.startDate !== 'Not specified') {
            const parsedDate = new Date(exp.startDate);
            if (!isNaN(parsedDate.getTime())) {
              startDate = parsedDate;
            }
          }
        } catch (err) {
          console.warn(`Failed to parse startDate: ${exp.startDate}`, err.message);
        }
        
        // Handle end date (null for current positions)
        let endDate = null;
        if (exp.endDate && exp.endDate !== 'Not specified' && 
            exp.endDate !== 'Current' && exp.endDate !== 'Present') {
          try {
            const parsedEndDate = new Date(exp.endDate);
            if (!isNaN(parsedEndDate.getTime())) {
              endDate = parsedEndDate;
            }
          } catch (err) {
            console.warn(`Failed to parse endDate: ${exp.endDate}`, err.message);
          }
        }
        
        // Determine if current position
        const isCurrent = exp.isCurrent || exp.current || !endDate || 
          exp.endDate === 'Current' || exp.endDate === 'Present';
          
        // Handle field name mappings from frontend to backend models
        // Map primaryFocusArea to focusArea if present
        const focusArea = exp.focusArea || exp.primaryFocusArea || 'General';
        
        // Create experience with proper defaults for required fields
        const newExperience = new Experience({
          userId, // Ensure userId is set from the authenticated request
          organization: exp.organization && exp.organization !== 'Not specified' 
            ? exp.organization : 'Unknown Organization',
          experienceType: exp.experienceType && exp.experienceType !== 'Not specified' 
            ? exp.experienceType : 'Work',
          positionTitle: exp.positionTitle && exp.positionTitle !== 'Not specified' 
            ? exp.positionTitle : 'Position',
          startDate,
          endDate,
          isCurrent,
          country: exp.country && exp.country !== 'Not specified' 
            ? exp.country : 'United States',
          state: exp.state && exp.state !== 'Not specified' 
            ? exp.state : '',
          participationFrequency: exp.participationFrequency && exp.participationFrequency !== 'Not specified' 
            ? exp.participationFrequency : 'Full-time',
          setting: exp.setting && exp.setting !== 'Not specified' 
            ? exp.setting : 'Professional',
          focusArea: focusArea !== 'Not specified' ? focusArea : 'General',
          description: exp.description && exp.description !== 'Not specified' 
            ? exp.description : 'Experience details not provided',
          isComplete: true
        });

        const savedExp = await newExperience.save();
        savedExperiences.push(savedExp);
        console.log(`Saved experience: ${savedExp.organization} - ${savedExp.positionTitle}`);
      } catch (expError) {
        console.error('Error saving individual experience:', expError);
        // Add to errors array but continue processing other experiences
        errors.push({
          data: exp,
          error: expError.message
        });
      }
    }

    // Update user's application progress even if some experiences failed
    if (savedExperiences.length > 0) {
      await updateUserProgress(userId);
    }

    // Return an appropriate response based on success/partial success
    if (savedExperiences.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Failed to save any experiences',
        errors
      });
    }

    return res.status(201).json({
      success: true,
      message: `${savedExperiences.length} experiences saved successfully${errors.length > 0 ? ` (${errors.length} failed)` : ''}`,
      experiences: savedExperiences,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Save multiple experiences error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error saving experiences',
      error: error.message
    });
  }
};

// Mark individual experience as most meaningful
exports.markAsMostMeaningful = async (req, res) => {
  try {
    const userId = req.userId;
    const experienceId = req.params.id;

    // Find the experience
    const experience = await Experience.findOne({ _id: experienceId, userId });
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    // Reset all experiences first
    await Experience.updateMany(
      { userId },
      { $set: { isMostMeaningful: false } }
    );

    // Mark this experience as most meaningful
    experience.isMostMeaningful = true;
    await experience.save();

    // Update user's application progress
    await updateUserProgress(userId);

    return res.status(200).json({
      success: true,
      message: 'Experience marked as most meaningful',
      experience
    });
  } catch (error) {
    console.error('Mark as most meaningful error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error marking experience as most meaningful',
      error: error.message
    });
  }
}; 