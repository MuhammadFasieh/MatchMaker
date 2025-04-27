const multer = require('multer');
const path = require('path');

// Configure storage for multer (disk storage for local file storage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/cvs'));
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