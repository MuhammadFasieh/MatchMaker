const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '../../uploads');
const profileImagesDir = path.join(uploadsDir, 'profileImages');
const cvsDir = path.join(uploadsDir, 'cvs');

// Create directories if they don't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}
if (!fs.existsSync(profileImagesDir)) {
  fs.mkdirSync(profileImagesDir, { recursive: true });
  console.log('Created profile images directory');
}
if (!fs.existsSync(cvsDir)) {
  fs.mkdirSync(cvsDir, { recursive: true });
  console.log('Created CVs directory');
}

// Configure storage for multer (disk storage for local file storage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set different destinations based on fieldname
    if (file.fieldname === 'profileImage') {
      cb(null, profileImagesDir);
    } else if (file.fieldname === 'cv') {
      cb(null, cvsDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept images, PDFs, and document formats
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword' || // .doc
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // .docx
    file.mimetype === 'text/plain' || // .txt
    file.mimetype === 'application/rtf' // .rtf
  ) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Please upload a supported file format (JPEG, PNG, PDF, DOC, DOCX, TXT, RTF).'), false);
  }
};

// Configure multer with limits and file filter
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter,
});

// Export middlewares for different upload scenarios
module.exports = {
  // For single file uploads
  uploadSingle: (fieldName) => upload.single(fieldName),
  
  // For multiple file uploads
  uploadMultiple: (fieldName, maxCount) => upload.array(fieldName, maxCount),
  
  // For multiple fields with different file types
  uploadFields: (fields) => upload.fields(fields),
}; 