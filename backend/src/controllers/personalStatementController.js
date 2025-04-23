const PersonalStatement = require('../models/PersonalStatement');
const User = require('../models/User');
const ResearchProduct = require('../models/ResearchProduct');
const Experience = require('../models/Experience');
const MiscellaneousQuestion = require('../models/MiscellaneousQuestion');
const ProgramPreference = require('../models/ProgramPreference');
const { generateThesisStatements, generateFinalStatement } = require('../services/personalStatementService');

// Get personal statement data
exports.getPersonalStatement = async (req, res) => {
  try {
    const userId = req.userId;

    // Find personal statement for the user
    const personalStatement = await PersonalStatement.findOne({ userId });
    if (!personalStatement) {
      return res.status(404).json({
        success: false,
        message: 'Personal statement not found'
      });
    }

    return res.status(200).json({
      success: true,
      personalStatement
    });
  } catch (error) {
    console.error('Get personal statement error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving personal statement',
      error: error.message
    });
  }
};

// Save initial personal statement data
exports.savePersonalStatementData = async (req, res) => {
  try {
    const userId = req.userId;
    const { specialties, motivation, characteristics, characteristicStories } = req.body;

    // Validate input
    if (!specialties || !specialties.length || !motivation || !characteristics || !characteristics.length || !characteristicStories) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if characteristics and stories match
    if (characteristics.length !== characteristicStories.length) {
      return res.status(400).json({
        success: false,
        message: 'Number of characteristics and stories must match'
      });
    }

    // Check if user already has a personal statement
    let personalStatement = await PersonalStatement.findOne({ userId });
    
    if (personalStatement) {
      // Update existing personal statement
      personalStatement.specialties = specialties;
      personalStatement.motivation = motivation;
      personalStatement.characteristics = characteristics;
      personalStatement.characteristicStories = characteristicStories;
    } else {
      // Create new personal statement
      personalStatement = new PersonalStatement({
        userId,
        specialties,
        motivation,
        characteristics,
        characteristicStories
      });
    }

    // Save personal statement
    await personalStatement.save();

    return res.status(200).json({
      success: true,
      message: 'Personal statement data saved successfully',
      personalStatement
    });
  } catch (error) {
    console.error('Save personal statement data error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error saving personal statement data',
      error: error.message
    });
  }
};

// Generate thesis statements
exports.generateThesisStatements = async (req, res) => {
  try {
    const userId = req.userId;

    // Get personal statement data
    const personalStatement = await PersonalStatement.findOne({ userId });
    if (!personalStatement) {
      return res.status(404).json({
        success: false,
        message: 'Personal statement not found'
      });
    }

    // Check if required fields are available
    if (!personalStatement.specialties.length || !personalStatement.motivation || 
        !personalStatement.characteristics.length || !personalStatement.characteristicStories.length) {
      return res.status(400).json({
        success: false,
        message: 'Personal statement data incomplete'
      });
    }

    // Generate thesis statements
    const thesisStatements = await generateThesisStatements(
      personalStatement.specialties,
      personalStatement.motivation,
      personalStatement.characteristics,
      personalStatement.characteristicStories
    );

    // Update personal statement with thesis statements
    personalStatement.thesisStatements = thesisStatements;
    await personalStatement.save();

    return res.status(200).json({
      success: true,
      message: 'Thesis statements generated successfully',
      thesisStatements
    });
  } catch (error) {
    console.error('Generate thesis statements error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error generating thesis statements',
      error: error.message
    });
  }
};

// Save selected thesis statement
exports.saveSelectedThesis = async (req, res) => {
  try {
    const userId = req.userId;
    const { selectedThesisStatement } = req.body;

    // Validate input
    if (!selectedThesisStatement) {
      return res.status(400).json({
        success: false,
        message: 'Selected thesis statement is required'
      });
    }

    // Get personal statement data
    const personalStatement = await PersonalStatement.findOne({ userId });
    if (!personalStatement) {
      return res.status(404).json({
        success: false,
        message: 'Personal statement not found'
      });
    }

    // Check if the selected thesis is one of the generated ones
    if (personalStatement.thesisStatements.length > 0 && 
        !personalStatement.thesisStatements.includes(selectedThesisStatement)) {
      return res.status(400).json({
        success: false,
        message: 'Selected thesis statement is not one of the generated options'
      });
    }

    // Update personal statement with selected thesis
    personalStatement.selectedThesisStatement = selectedThesisStatement;
    await personalStatement.save();

    return res.status(200).json({
      success: true,
      message: 'Thesis statement selected successfully',
      selectedThesisStatement
    });
  } catch (error) {
    console.error('Save selected thesis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error saving selected thesis',
      error: error.message
    });
  }
};

// Generate final personal statement
exports.generateFinalStatement = async (req, res) => {
  try {
    const userId = req.userId;

    // Get personal statement data
    const personalStatement = await PersonalStatement.findOne({ userId });
    if (!personalStatement) {
      return res.status(404).json({
        success: false,
        message: 'Personal statement not found'
      });
    }

    // Check if a thesis statement has been selected
    if (!personalStatement.selectedThesisStatement) {
      return res.status(400).json({
        success: false,
        message: 'No thesis statement selected'
      });
    }

    // Generate final statement
    const { finalStatement, wordCount } = await generateFinalStatement(
      personalStatement.specialties,
      personalStatement.motivation,
      personalStatement.characteristics,
      personalStatement.characteristicStories,
      personalStatement.selectedThesisStatement
    );

    // Update personal statement with final statement
    personalStatement.finalStatement = finalStatement;
    personalStatement.wordCount = wordCount;
    personalStatement.isComplete = true;
    await personalStatement.save();

    // Update user's application progress
    await updateUserProgress(userId);

    return res.status(200).json({
      success: true,
      message: 'Final personal statement generated successfully',
      finalStatement,
      wordCount
    });
  } catch (error) {
    console.error('Generate final statement error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error generating final statement',
      error: error.message
    });
  }
};

// Save final personal statement (if user wants to edit the generated one)
exports.saveFinalStatement = async (req, res) => {
  try {
    const userId = req.userId;
    const { finalStatement } = req.body;

    // Validate input
    if (!finalStatement) {
      return res.status(400).json({
        success: false,
        message: 'Final statement is required'
      });
    }

    // Get personal statement data
    const personalStatement = await PersonalStatement.findOne({ userId });
    if (!personalStatement) {
      return res.status(404).json({
        success: false,
        message: 'Personal statement not found'
      });
    }

    // Calculate word count
    const wordCount = finalStatement.split(/\s+/).length;

    // Update personal statement with final statement
    personalStatement.finalStatement = finalStatement;
    personalStatement.wordCount = wordCount;
    personalStatement.isComplete = true;
    await personalStatement.save();

    // Update user's application progress
    await updateUserProgress(userId);

    return res.status(200).json({
      success: true,
      message: 'Final personal statement saved successfully',
      finalStatement,
      wordCount
    });
  } catch (error) {
    console.error('Save final statement error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error saving final statement',
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
    const researchComplete = await ResearchProduct.exists({ userId, isComplete: true });
    const experiencesComplete = await Experience.exists({ userId, isComplete: true });
    const miscComplete = await MiscellaneousQuestion.exists({ userId, isComplete: true });
    const programPrefsComplete = await ProgramPreference.exists({ userId, isComplete: true });

    // Count completed sections
    let completedSections = 1; // Personal statement is complete
    if (researchComplete) completedSections++;
    if (experiencesComplete) completedSections++;
    if (miscComplete) completedSections++;
    if (programPrefsComplete) completedSections++;

    // Update user's progress
    user.calculateProgress(completedSections);
    await user.save();
  } catch (error) {
    console.error('Update user progress error:', error);
  }
}; 