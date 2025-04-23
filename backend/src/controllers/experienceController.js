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
    const userId = req.userId;

    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CV file provided'
      });
    }

    // Read the file content (if it's a PDF, we'd need to use a PDF parsing library)
    let cvText;
    if (req.file.mimetype === 'application/pdf') {
      // For this implementation, we'll assume PDF extraction is handled elsewhere
      // In a real application, you would use a library like pdf-parse
      cvText = "PDF parsing would happen here";
    } else {
      // For text files
      cvText = await readFile(req.file.path, 'utf8');
    }

    // Extract experiences from CV text
    const extractedExperiences = await extractExperiences(cvText);

    // Save extracted experiences to database
    const savedExperiences = [];
    for (const exp of extractedExperiences) {
      const startDate = exp.startDate ? new Date(exp.startDate) : new Date();
      const endDate = exp.endDate && exp.endDate !== 'Current' ? new Date(exp.endDate) : null;
      const isCurrent = !endDate;

      const newExperience = new Experience({
        userId,
        organization: exp.organization,
        experienceType: exp.experienceType,
        positionTitle: exp.positionTitle,
        startDate,
        endDate,
        isCurrent,
        country: exp.country,
        state: exp.state,
        participationFrequency: exp.participationFrequency,
        setting: exp.setting,
        focusArea: exp.focusArea,
        description: exp.description,
        isComplete: true
      });

      await newExperience.save();
      savedExperiences.push(newExperience);
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

// Helper function to update user's application progress
const updateUserProgress = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Check completion of other sections
    const personalStatementComplete = await PersonalStatement.exists({ userId, isComplete: true });
    const researchComplete = await ResearchProduct.exists({ userId, isComplete: true });
    const miscComplete = await MiscellaneousQuestion.exists({ userId, isComplete: true });
    const programPrefsComplete = await ProgramPreference.exists({ userId, isComplete: true });

    // Check that at least one experience has been marked as most meaningful
    const experiencesCount = await Experience.countDocuments({ userId });
    const mostMeaningfulCount = await Experience.countDocuments({ userId, isMostMeaningful: true });

    // Experiences are complete if there are experiences and at least one is most meaningful
    const experiencesComplete = experiencesCount > 0 && mostMeaningfulCount > 0;
    
    // Count completed sections
    let completedSections = experiencesComplete ? 1 : 0;
    if (personalStatementComplete) completedSections++;
    if (researchComplete) completedSections++;
    if (miscComplete) completedSections++;
    if (programPrefsComplete) completedSections++;

    // Update user's progress
    user.calculateProgress(completedSections);
    await user.save();
  } catch (error) {
    console.error('Update user progress error:', error);
  }
}; 