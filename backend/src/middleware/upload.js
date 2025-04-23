const multer = require('multer');

// Configure storage for multer (memory storage for S3 upload)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept images and PDFs
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Please upload a JPEG, PNG, or PDF file.'), false);
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