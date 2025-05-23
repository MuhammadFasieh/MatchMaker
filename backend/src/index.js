require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/error');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/users');
const programRoutes = require('./routes/programRoutes');
const applicationRoutes = require('./routes/applications');
const dashboardRoutes = require('./routes/dashboardRoutes');
const openaiRoutes = require('./routes/openaiRoutes');
const personalStatementRoutes = require('./routes/personalStatementRoutes');
const researchRoutes = require('./routes/researchRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const miscRoutes = require('./routes/miscRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Increase the request size limit for PDF uploads and downloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Set response timeout for large file operations like PDF generation
app.use((req, res, next) => {
  // Increase timeout to 2 minutes for PDF generation routes
  if (req.path.includes('/download-pdf') || req.path.includes('/generate')) {
    req.setTimeout(120000); // 2 minutes
    res.setTimeout(120000); // 2 minutes
  }
  next();
});

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers));
  
  // Add User info to log if authenticated
  if (req.user) {
    console.log("User authenticated:", req.user.name || req.user.email);
  }
  
  next();
});

// Serve static files if needed
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes - make sure to register program routes before other potentially conflicting routes
app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes); // This is the corrected path for program routes
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/openai', openaiRoutes);
app.use('/api/personal-statement', personalStatementRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/misc-questions', miscRoutes);

// Debugging route
app.get('/api/debug', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Debug route working',
    routes: {
      '/api/programs': 'Registered with proper order',
      '/api/programs/preferences': 'Available via GET and POST',
      '/api/experiences': 'Registered',
      '/api/experiences/parse-cv': 'Available via POST',
      '/api/misc-questions': 'Registered'
    }
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('MatchMaker API is running');
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server after successful DB connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

module.exports = app; // For testing purposes 