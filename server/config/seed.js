import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import Subscriber from '../models/Subscriber.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

function loadJsonFile(filename, fallback) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (err) {
    console.error(`Error loading seed data from ${filename}:`, err.message);
  }
  return fallback;
}

export async function seedInitialData() {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const products = loadJsonFile('products.json', []);
      if (products.length > 0) {
        await Product.insertMany(products);
        console.log(`🌱 MongoDB: Seeded ${products.length} products from products.json`);
      }
    }

    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      const couponsObj = loadJsonFile('coupons.json', {});
      const couponsArray = Object.values(couponsObj);
      if (couponsArray.length > 0) {
        await Coupon.insertMany(couponsArray);
        console.log(`🌱 MongoDB: Seeded ${couponsArray.length} coupons from coupons.json`);
      }
    }

    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      const orders = loadJsonFile('orders.json', []);
      if (orders.length > 0) {
        await Order.insertMany(orders);
        console.log(`🌱 MongoDB: Seeded ${orders.length} orders from orders.json`);
      }
    }

    const subscriberCount = await Subscriber.countDocuments();
    if (subscriberCount === 0) {
      const subscribers = loadJsonFile('subscribers.json', []);
      if (subscribers.length > 0) {
        await Subscriber.insertMany(subscribers);
        console.log(`🌱 MongoDB: Seeded ${subscribers.length} subscribers from subscribers.json`);
      }
    }
  } catch (error) {
    console.error('⚠️ MongoDB Seeding Warning:', error.message);
  }
}
