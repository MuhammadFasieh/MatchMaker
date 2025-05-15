/**
 * OpenAI Service - Handles integration with OpenAI API
 */
const { Configuration, OpenAIApi } = require('openai');
const config = require('../config');
const logger = require('../utils/logger');

// Configure OpenAI
const configuration = new Configuration({
  apiKey: config.openai.apiKey,
});
const openai = new OpenAIApi(configuration);

/**
 * Generate thesis statements for personal statement
 * @param {Object} data - Input data for thesis generation
 * @returns {Array} - Array of thesis statements
 */
exports.generateThesisStatements = async (data) => {
  try {
    // Check if OpenAI API key is configured
    if (!config.openai.apiKey) {
      logger.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    const { specialties, reason, characteristics, experiences } = data;

    const prompt = `Generate 3 different thesis statements for a medical school personal statement. 
    The applicant is interested in ${specialties.join(', ')}. 
    Their reason for pursuing medicine is: ${reason}. 
    Three characteristics that define them are: ${characteristics.join(', ')}. 
    Three meaningful experiences they've had are: ${experiences.join(', ')}.
    
    Each thesis statement should be concise (1-2 sentences), compelling, and capture the essence of why they are pursuing medicine.
    Format the output as a JSON array of strings, with each string being a thesis statement.`;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 500,
      temperature: 0.7,
    });

    // Parse the response text as JSON
    const responseText = response.data.choices[0].text.trim();
    let thesisStatements;
    
    try {
      thesisStatements = JSON.parse(responseText);
    } catch (error) {
      // If JSON parsing fails, try to extract statements manually
      const statements = responseText.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, ''));
      
      thesisStatements = statements.slice(0, 3);
    }

    // Ensure we have exactly 3 statements
    if (!Array.isArray(thesisStatements) || thesisStatements.length < 3) {
      throw new Error('Failed to generate thesis statements');
    }

    return thesisStatements.slice(0, 3);
  } catch (error) {
    logger.error('Error generating thesis statements:', error);
    
    // If OpenAI API key is invalid, return mock data
    if (error.response?.status === 401 || error.message.includes('API key')) {
      logger.warn('Using mock thesis statements due to API key issue');
      return [
        "My commitment to advancing healthcare equity through clinical research and community outreach has prepared me to become a physician who bridges the gap between medical innovation and compassionate patient care.",
        "Through my experiences in emergency medicine and global health initiatives, I've developed a passion for addressing healthcare disparities and a determination to serve as an advocate for underserved populations.",
        "Combining my scientific curiosity with empathetic patient interactions has solidified my desire to pursue medicine as a career where I can apply both analytical thinking and human connection to improve lives."
      ];
    }
    
    throw error;
  }
};

/**
 * Generate complete personal statement
 * @param {Object} data - Input data for personal statement generation
 * @returns {String} - Generated personal statement
 */
exports.generatePersonalStatement = async (data) => {
  try {
    // Check if OpenAI API key is configured
    if (!config.openai.apiKey) {
      logger.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    const { specialties, reason, characteristics, experiences, selectedThesis } = data;

    const prompt = `Write a compelling medical school personal statement using the following thesis statement:
    "${selectedThesis}"
    
    The applicant is interested in ${specialties.join(', ')}. 
    Their reason for pursuing medicine is: ${reason}. 
    Three characteristics that define them are: ${characteristics.join(', ')}. 
    Three meaningful experiences they've had are: ${experiences.join(', ')}.
    
    The personal statement should be well-structured, engaging, and approximately 500-600 words. 
    It should flow naturally, incorporating the thesis statement, characteristics, and experiences in a cohesive narrative.
    The statement should demonstrate reflection, personal growth, and a clear connection to why the applicant wants to pursue medicine.`;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 2000,
      temperature: 0.7,
    });

    const personalStatement = response.data.choices[0].text.trim();
    return personalStatement;
  } catch (error) {
    logger.error('Error generating personal statement:', error);
    
    // If OpenAI API key is invalid, return mock data
    if (error.response?.status === 401 || error.message.includes('API key')) {
      logger.warn('Using mock personal statement due to API key issue');
      return "This is a placeholder personal statement. The OpenAI API key is invalid or not configured properly. Please contact the administrator to resolve this issue.\n\nIn a real scenario, this would be a compelling 500-600 word personal statement that incorporates your thesis statement, characteristics, and experiences in a cohesive narrative that demonstrates your reflection, personal growth, and clear connection to medicine.";
    }
    
    throw error;
  }
};

/**
 * Generate enhanced descriptions for meaningful experiences
 * @param {Array} experiences - Array of experience objects to enhance
 * @param {String} instructions - User instructions for enhancement
 * @returns {Array} - Array of enhanced experience objects
 */
exports.enhanceExperiences = async (experiences, instructions) => {
  try {
    // Check if OpenAI API key is configured
    if (!config.openai.apiKey) {
      logger.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    // Process each experience with OpenAI
    const enhancedExperiences = [];
    
    for (const experience of experiences) {
      const { organization, positionTitle, description, startDate, endDate, country, state } = experience;
      
      const prompt = `Enhance and expand on the following professional experience for a medical school application:

Organization: ${organization}
Position: ${positionTitle}
Duration: ${startDate} - ${endDate}
Location: ${country}${state ? ', ' + state : ''}
Current Description: ${description}

User Instructions: ${instructions}

Please provide an enhanced, reflective description that:
1. Highlights the skills and qualities demonstrated
2. Shows personal growth and insights gained
3. Connects the experience to the applicant's medical aspirations
4. Is written in first person perspective
5. Is approximately 150-200 words

Return only the enhanced description text.`;

      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        max_tokens: 500,
        temperature: 0.7,
      });

      const expandedDescription = response.data.choices[0].text.trim();
      
      enhancedExperiences.push({
        ...experience,
        expandedDescription
      });
    }

    return enhancedExperiences;
  } catch (error) {
    logger.error('Error enhancing experiences:', error);
    
    // If OpenAI API key is invalid, return mock data
    if (error.response?.status === 401 || error.message.includes('API key')) {
      logger.warn('Using mock enhanced experiences due to API key issue');
      
      return experiences.map(exp => ({
        ...exp,
        expandedDescription: `This is a placeholder enhanced description for my experience at ${exp.organization} as a ${exp.positionTitle}. The OpenAI API key is invalid or not configured properly. In a real scenario, this would be a compelling 150-200 word description that highlights skills, shows personal growth, and connects to my medical aspirations.`
      }));
    }
    
    throw error;
  }
};

module.exports = {
  generateThesisStatements,
  generatePersonalStatement,
  enhanceExperiences
}; 