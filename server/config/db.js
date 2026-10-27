import mongoose from 'mongoose';
import { seedInitialData } from './seed.js';

let isConnected = false;

export const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('ℹ️ [DATABASE] MONGODB_URI is not set. Operating in JSON file storage mode.');
    console.log('💡 Tip: Set MONGODB_URI in your .env or hosting environment to connect to MongoDB Atlas.');
    return;
  }

  try {
    console.log('🔄 [DATABASE] Connecting to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 7000,
    });
    isConnected = true;
    console.log('✅ [DATABASE] Successfully connected to MongoDB Database!');

    // Automatically seed initial data if collections are empty
    await seedInitialData();
  } catch (error) {
    console.error('⚠️ [DATABASE] MongoDB connection failed:', error.message);
    console.log('ℹ️ [DATABASE] Falling back gracefully to JSON file storage mode.');
  }

 
