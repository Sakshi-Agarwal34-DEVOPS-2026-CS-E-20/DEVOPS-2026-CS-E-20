import express from 'express';
import { readData } from '../data/db.js';

const router = express.Router();
const startTime = Date.now();

router.get('/', (req, res) => {
  try {
    const products = readData('products.json', []);
    const orders = readData('orders.json', []);
    const coupons = readData('coupons.json', {});

    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

    res.json({
      status: 'healthy',
      server: 'LUMEN LUXE E-Commerce API',
      version: '2.0.0',
      uptime: `${uptimeSeconds}s`,
      timestamp: new Date().toISOString(),
      database: {
        productsCount: products.length,
        ordersCount: orders.length,
        activeCouponsCount: Object.keys(coupons).length,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

export default router;
