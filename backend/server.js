const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/error');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize app
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Logging middleware in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`Server running in ${process.env.NODE_ENV} mode`);
}

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  if (req.headers.authorization) {
    console.log('Auth header present');
  } else {
    console.log('No auth header found');
  }
  next();
});

// Route files
const auth = require('./src/routes/authRoutes');
const profile = require('./src/routes/profile');
const dashboard = require('./src/routes/dashboard');
const application = require('./src/routes/application');
const experiences = require('./src/routes/experienceRoutes');
const research = require('./src/routes/researchRoutes');
const openai = require('./src/routes/openaiRoutes');
const personalStatement = require('./src/routes/personalStatementRoutes');
const miscQuestions = require('./src/routes/miscRoutes');
const programs = require('./src/routes/programRoutes');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/profile', profile);
app.use('/api/dashboard', dashboard);
app.use('/api/application', application);
app.use('/api/experiences', experiences);
app.use('/api/research', research);
app.use('/api/openai', openai);
app.use('/api/personal-statement', personalStatement);
app.use('/api/misc-questions', miscQuestions);
app.use('/api/programs', programs);

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  // Close server & exit process
  server.close(() => process.exit(1));
}); 