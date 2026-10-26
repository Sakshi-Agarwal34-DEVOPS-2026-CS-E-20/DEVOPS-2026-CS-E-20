import express from 'express';
import { readData } from '../data/db.js';
import { isMongoConnected } from '../config/db.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';

const router = express.Router();
const startTime = Date.now();

router.get('/', async (req, res) => {
  try {
    let productsCount = 0;
    let ordersCount = 0;
    let activeCouponsCount = 0;

    if (isMongoConnected()) {
      [productsCount, ordersCount, activeCouponsCount] = await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        Coupon.countDocuments({ active: { $ne: false } }),
      ]);
    } else {
      const products = readData('products.json', []);
      const orders = readData('orders.json', []);
      const coupons = readData('coupons.json', {});
      productsCount = products.length;
      ordersCount = orders.length;
      activeCouponsCount = Object.keys(coupons).length;
    }

    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

    res.json({
      status: 'healthy',
      server: 'LUMEN LUXE E-Commerce API',
      version: '2.0.0',
      uptime: `${uptimeSeconds}s`,
      timestamp: new Date().toISOString(),
      database: {
        type: isMongoConnected() ? 'MongoDB' : 'JSON File Store (Fallback)',
        connected: isMongoConnected(),
        productsCount,
        ordersCount,
        activeCouponsCount,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

export default router;
