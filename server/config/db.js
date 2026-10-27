import mongoose from 'mongoose';
import { seedInitialData } from './seed.js';

let isConnected = false;

export const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Automatically encode special characters like '@' in password if not already encoded
export function formatMongoUri(uri) {
  if (!uri) return uri;
  const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):(.*)@([^@\/]+)(\/.*)?$/);
  if (match) {
    const [, protocol, user, pass, host, rest = ''] = match;
    if (pass.includes('@')) {
      const encodedPass = encodeURIComponent(decodeURIComponent(pass));
      return `${protocol}${encodeURIComponent(decodeURIComponent(user))}:${encodedPass}@${host}${rest}`;
    }
  }
  return uri;
}

export async function connectDB() {
  const rawUri = process.env.MONGODB_URI;

  if (!rawUri) {
    console.log('ℹ️ [DATABASE] MONGODB_URI is not set. Operating in JSON file storage mode.');
    console.log('💡 Tip: Set MONGODB_URI in your .env or hosting environment to connect to MongoDB Atlas.');
    return;
  }

  const uri = formatMongoUri(rawUri);

  try {
    console.log('🔄 [DATABASE] Connecting to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log('✅ [DATABASE] Successfully connected to MongoDB Database!');

    // Automatically seed initial data if collections are empty
    await seedInitialData();
  } catch (error) {
    console.error('⚠️ [DATABASE] MongoDB connection failed:', error.message);
    console.log('ℹ️ [DATABASE] Falling back gracefully to JSON file storage mode.');
  }

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('⚠️ [DATABASE] MongoDB disconnected. Using fallback storage.');
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    console.log('✅ [DATABASE] MongoDB reconnected.');
  });
}

