import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import Subscriber from '../models/Subscriber.js';

async function testMongoConnection() {
  const uri = process.env.MONGODB_URI;

  console.log('\n======================================================');
  console.log('🍃 LUMEN LUXE — MONGODB ATLAS DIAGNOSTIC & TEST TOOL');
  console.log('======================================================\n');

  if (!uri) {
    console.log('❌ MONGODB_URI is not defined in your environment or .env file.');
    console.log('\n👉 Instructions to connect MongoDB Atlas:');
    console.log('   1. Create a free cluster on https://cloud.mongodb.com');
    console.log('   2. Create a Database User (Username & Password)');
    console.log('   3. In Network Access, allow IP Address: 0.0.0.0/0 (allow access from anywhere)');
    console.log('   4. Copy your connection string into .env file:');
    console.log('      MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/lumen-luxe?retryWrites=true&w=majority\n');
    process.exit(1);
  }

  // Hide password in logged URI for security
  const maskedUri = uri.replace(/\/\/(.*):(.*)@/, '//$1:****@');
  console.log(`🔌 Attempting connection to: ${maskedUri}`);

  try {
    const startTime = Date.now();
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    const latency = Date.now() - startTime;

    console.log(`✅ Successfully connected to MongoDB Atlas! (Latency: ${latency}ms)\n`);

    // Verify Collections
    const [productsCount, ordersCount, couponsCount, subscribersCount] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Coupon.countDocuments(),
      Subscriber.countDocuments(),
    ]);

    console.log('📊 Current Collection Statistics:');
    console.log(`   - Products:    ${productsCount}`);
    console.log(`   - Orders:      ${ordersCount}`);
    console.log(`   - Coupons:     ${couponsCount}`);
    console.log(`   - Subscribers: ${subscribersCount}\n`);

    if (productsCount === 0) {
      console.log('ℹ️ Products collection is empty. Seeding will run automatically when you launch the server (npm start).');
    } else {
      console.log('✨ Data persistence is active and verified.');
    }

   
