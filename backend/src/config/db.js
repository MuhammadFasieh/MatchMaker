const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection string from environment or fallback
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/matchmaker';
    console.log('MongoDB connection string:', mongoURI.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, 'mongodb+srv://$1:****@'));
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    
    // In development mode, don't exit the process to allow the app to function without DB
    if (process.env.NODE_ENV === 'production') {
      console.error('MongoDB connection failed in production mode, exiting...');
      process.exit(1);
    } else {
      console.warn('MongoDB connection failed in development mode, continuing without database...');
      // Return null to indicate no connection was established
      return null;
    }
  }
};

module.exports = connectDB; 