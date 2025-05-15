/**
 * Controller for OpenAI integrations
 */
const openaiService = require('../services/openaiService');

/**
 * Generate thesis statements for personal statement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateThesisStatements = async (req, res) => {
  try {
    const { 
      specialties, 
      reason, 
      characteristics, 
      experiences 
    } = req.body;
    
    // Validate required fields
    if (!specialties || !reason || !characteristics || !experiences) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Validate characteristics and experiences have 3 items
    if (characteristics.length !== 3 || experiences.length !== 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Must provide exactly 3 characteristics and experiences' 
      });
    }
    
    const thesisStatements = await openaiService.generateThesisStatements({
      specialties,
      reason,
      characteristics,
      experiences
    });
    
    res.status(200).json({
      success: true,
      data: thesisStatements
    });
  } catch (error) {
    console.error('Error in generateThesisStatements controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating thesis statements'
    });
  }
};

/**
 * Generate complete personal statement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generatePersonalStatement = async (req, res) => {
  try {
    const { 
      specialties, 
      reason, 
      characteristics, 
      experiences,
      selectedThesis 
    } = req.body;
    
    // Validate required fields
    if (!specialties || !reason || !characteristics || !experiences || !selectedThesis) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Validate characteristics and experiences have 3 items
    if (characteristics.length !== 3 || experiences.length !== 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Must provide exactly 3 characteristics and experiences' 
      });
    }
    
    const personalStatement = await openaiService.generatePersonalStatement({
      specialties,
      reason,
      characteristics,
      experiences,
      selectedThesis
    });
    
    res.status(200).json({
      success: true,
      data: personalStatement
    });
  } catch (error) {
    console.error('Error in generatePersonalStatement controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating personal statement'
    });
  }
};

/**
 * Generate enhanced descriptions for meaningful experiences
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.enhanceExperiences = async (req, res) => {
  try {
    const { experiences, instructions } = req.body;

    // Validate required fields
    if (!experiences || !Array.isArray(experiences) || experiences.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Must provide at least one experience to enhance'
      });
    }

    if (!instructions || typeof instructions !== 'string' || instructions.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Must provide enhancement instructions'
      });
    }

    // Call OpenAI service to enhance the experiences
    const enhancedExperiences = await openaiService.enhanceExperiences(experiences, instructions);

    res.status(200).json({
      success: true,
      enhancedExperiences
    });
  } catch (error) {
    console.error('Error in enhanceExperiences controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error enhancing experiences'
    });
  }
}; 