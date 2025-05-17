import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Retrieve MongoDB URI from environment variables
const DBURL = process.env.DB_URL || '';

const dbconnect = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(DBURL, {
      connectTimeoutMS: 30000, // Set connection timeout to 30 seconds
    });
    console.log('MongoDB connected successfully');
  } catch (e) {
    console.error('MongoDB connection error:', e);
    process.exit(1); // Exit the process if connection fails
  }
};

// Listen to MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

export default dbconnect;
