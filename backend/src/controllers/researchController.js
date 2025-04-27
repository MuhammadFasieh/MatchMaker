const ResearchProduct = require('../models/ResearchProduct');
const User = require('../models/User');
const PersonalStatement = require('../models/PersonalStatement');
const Experience = require('../models/Experience');
const MiscellaneousQuestion = require('../models/MiscellaneousQuestion');
const ProgramPreference = require('../models/ProgramPreference');
const { extractResearchProducts } = require('../services/cvParsingService');
const { enrichResearchProduct } = require('../services/pubmedService');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const pdf = require('pdf-parse');
const { uploadToS3 } = require('../config/aws');

// Get all research products for a user
exports.getResearchProducts = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all research products for the user
    const researchProducts = await ResearchProduct.find({ userId });

    return res.status(200).json({
      success: true,
      researchProducts
    });
  } catch (error) {
    console.error('Get research products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving research products',
      error: error.message
    });
  }
};

// Parse CV to extract research products
exports.parseCV = async (req, res) => {
  try {
    // Get user ID from the authenticated user
    const userId = req.user.id;

    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CV file provided'
      });
    }

    console.log("File received:", {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    // Get the file path
    const filePath = req.file.path;
      
    // Validate file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found at path:', filePath);
      return res.status(500).json({
        success: false,
        message: 'Error: File not found after upload'
      });
    }

    // Read the file content
    let cvText;
    try {
    if (req.file.mimetype === 'application/pdf') {
        // Read PDF file
        const dataBuffer = await readFile(filePath);
        const data = await pdf(dataBuffer);
        cvText = data.text;
        
        if (!cvText || cvText.trim().length === 0) {
          throw new Error('No text content extracted from PDF');
        }
    } else {
      // For text files
        cvText = await readFile(filePath, 'utf8');
      }
    } catch (readError) {
      console.error('Error reading file:', readError);
      return res.status(500).json({
        success: false,
        message: 'Error reading file content',
        error: readError.message
      });
    }

    // Extract research products from CV text
    let extractedProducts;
    try {
      extractedProducts = await extractResearchProducts(cvText);
      
      if (!extractedProducts || !Array.isArray(extractedProducts)) {
        throw new Error('Invalid response from research product extraction');
      }
    } catch (extractError) {
      console.error('Error extracting research products:', extractError);
      return res.status(500).json({
        success: false,
        message: 'Error extracting research products from CV',
        error: extractError.message
      });
    }

    // Enrich and save extracted products to database
    const savedProducts = [];
    for (const product of extractedProducts) {
      try {
        // Enrich with PubMed data
        const enrichedProduct = await enrichResearchProduct(product);
        
        // Save to database
        const savedProduct = await ResearchProduct.create({
        userId,
          ...enrichedProduct
        });
        
        savedProducts.push(savedProduct);
      } catch (productError) {
        console.error('Error processing individual product:', productError);
        // Continue with other products even if one fails
      }
    }

    return res.status(200).json({
      success: true,
      message: 'CV parsed successfully',
      data: savedProducts
    });
  } catch (error) {
    console.error('Parse CV error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error parsing CV',
      error: error.message
    });
  }
};

// Add a single research product manually
exports.addResearchProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      type,
      status,
      authors,
      journal,
      volume,
      issueNumber,
      pages,
      pmid,
      monthPublished,
      yearPublished
    } = req.body;

    // Validate required fields
    if (!title || !type || !status || !authors) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create new research product
    const researchProduct = new ResearchProduct({
      userId,
      title,
      type,
      status,
      authors,
      journal,
      volume,
      issueNumber,
      pages,
      pmid,
      monthPublished,
      yearPublished,
      isComplete: true
    });

    // Save to database
    await researchProduct.save();

    // Update user's application progress
    await updateUserProgress(userId);

    return res.status(201).json({
      success: true,
      message: 'Research product added successfully',
      researchProduct
    });
  } catch (error) {
    console.error('Add research product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error adding research product',
      error: error.message
    });
  }
};

// Update a research product
exports.updateResearchProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;
    const updateData = req.body;

    // Find the research product
    const researchProduct = await ResearchProduct.findOne({ _id: productId, userId });
    if (!researchProduct) {
      return res.status(404).json({
        success: false,
        message: 'Research product not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'userId' && key !== '_id') {
        researchProduct[key] = updateData[key];
      }
    });

    // Save updated product
    await researchProduct.save();

    return res.status(200).json({
      success: true,
      message: 'Research product updated successfully',
      researchProduct
    });
  } catch (error) {
    console.error('Update research product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating research product',
      error: error.message
    });
  }
};

// Delete a research product
exports.deleteResearchProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    // Find and delete the research product
    const researchProduct = await ResearchProduct.findOneAndDelete({ _id: productId, userId });
    if (!researchProduct) {
      return res.status(404).json({
        success: false,
        message: 'Research product not found'
      });
    }

    // Update user's application progress
    await updateUserProgress(userId);

    return res.status(200).json({
      success: true,
      message: 'Research product deleted successfully'
    });
  } catch (error) {
    console.error('Delete research product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting research product',
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
    const experiencesComplete = await Experience.exists({ userId, isComplete: true });
    const miscComplete = await MiscellaneousQuestion.exists({ userId, isComplete: true });
    const programPrefsComplete = await ProgramPreference.exists({ userId, isComplete: true });

    // Count completed sections
    let completedSections = 1; // Research products are complete
    if (personalStatementComplete) completedSections++;
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