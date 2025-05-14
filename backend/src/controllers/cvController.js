const path = require('path');
const fs = require('fs');
const { extractExperiences } = require('../services/cvParsingService');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

// Upload directory path
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Attempt to load PDF parsing library if available
let pdfParse;
try {
  pdfParse = require('pdf-parse');
  console.log('PDF parsing library loaded successfully');
} catch (error) {
  console.warn('pdf-parse library not available, PDF parsing will be limited');
  console.warn('To enable PDF parsing, install pdf-parse: npm install pdf-parse');
  pdfParse = null;
}

// Extract text from a PDF file
const extractTextFromPDF = async (filePath) => {
  console.log(`Attempting to extract text from PDF: ${filePath}`);
  
  if (!pdfParse) {
    console.warn('pdf-parse library not available, using fallback method');
    // Fallback to dummy text extraction
    return "PDF TEXT EXTRACTION REQUIRES THE PDF-PARSE LIBRARY.\nPlease install it with: npm install pdf-parse";
  }
  
  try {
    const dataBuffer = await readFileAsync(filePath);
    const data = await pdfParse(dataBuffer);
    
    if (!data || !data.text) {
      throw new Error('PDF parsing resulted in empty text');
    }
    
    console.log(`Successfully extracted ${data.text.length} characters from PDF`);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

// Extract text from a file based on its type
const extractTextFromFile = async (file) => {
  const fileExtension = path.extname(file.path).toLowerCase();
  
  if (fileExtension === '.pdf') {
    return await extractTextFromPDF(file.path);
  } else if (fileExtension === '.txt' || fileExtension === '.text') {
    const text = await readFileAsync(file.path, 'utf8');
    return text;
  } else if (fileExtension === '.docx' || fileExtension === '.doc') {
    // For demonstration purposes - in a real app you would use a library like mammoth
    return "WORD DOCUMENT PARSING REQUIRES ADDITIONAL LIBRARIES.\nPlease install mammoth for .docx parsing.";
  } else {
    throw new Error(`Unsupported file type: ${fileExtension}`);
  }
};

// Upload and parse a CV
const uploadAndParseCV = async (req, res) => {
  try {
    console.log('CV upload request received');
    
    if (!req.file) {
      console.error('No file uploaded in request');
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    console.log(`File received: ${req.file.originalname}, size: ${req.file.size} bytes, type: ${req.file.mimetype}`);
    
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const supportedExtensions = ['.pdf', '.txt', '.text', '.docx', '.doc'];
    
    if (!supportedExtensions.includes(fileExtension)) {
      // Remove the uploaded file if not supported
      fs.unlinkSync(req.file.path);
      console.error(`Unsupported file type: ${fileExtension}`);
      return res.status(400).json({
        success: false,
        message: `Unsupported file type: ${fileExtension}. Please upload a PDF, TXT, or DOC file.`
      });
    }

    // Extract text from the file
    let cvText;
    try {
      cvText = await extractTextFromFile(req.file);
      console.log(`Extracted ${cvText.length} characters of text from the CV file`);
    } catch (extractError) {
      console.error('Error extracting text from file:', extractError);
      return res.status(500).json({
        success: false,
        message: `Failed to extract text from the uploaded file: ${extractError.message}`
      });
    }

    // Extract experiences from the CV text
    let experiences;
    try {
      console.log('Extracting experiences from CV text');
      experiences = await extractExperiences(cvText);
      console.log(`Successfully extracted ${experiences.length} experiences`);
    } catch (extractError) {
      console.error('Error extracting experiences:', extractError);
      
      // Check for specific error types
      if (extractError.code === 'INVALID_API_KEY') {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired OpenAI API key. Please check your API key configuration.',
          error: extractError.message,
          errorCode: 'INVALID_API_KEY'
        });
      } else if (extractError.code === 'RATE_LIMIT_EXCEEDED') {
        return res.status(429).json({
          success: false,
          message: 'OpenAI rate limit exceeded. Please try again later.',
          error: extractError.message,
          errorCode: 'RATE_LIMIT_EXCEEDED'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: `Failed to extract experiences: ${extractError.message}`,
          errorCode: 'EXTRACTION_ERROR'
        });
      }
    }

    // Return the parsed data
    return res.status(200).json({
      success: true,
      message: 'CV uploaded and parsed successfully',
      data: experiences
    });
  } catch (error) {
    console.error('Error in uploadAndParseCV:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading and parsing CV',
      error: error.message,
      errorCode: error.code || 'UNKNOWN_ERROR'
    });
  }
};

module.exports = {
  uploadAndParseCV
}; 