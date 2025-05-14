require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/error');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/users');
const programRoutes = require('./routes/programs');
const applicationRoutes = require('./routes/applications');
const dashboardRoutes = require('./routes/dashboardRoutes');
const openaiRoutes = require('./routes/openaiRoutes');
const personalStatementRoutes = require('./routes/personalStatementRoutes');
const researchRoutes = require('./routes/researchRoutes');
const experienceRoutes = require('./routes/experienceRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files if needed
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/openai', openaiRoutes);
app.use('/api/personal-statement', personalStatementRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/experiences', experienceRoutes);

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