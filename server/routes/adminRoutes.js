import express from 'express';
import { readData } from '../data/db.js';
import { isMongoConnected } from '../config/db.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Subscriber from '../models/Subscriber.js';

const router = express.Router();

// Optional Admin API security middleware
const adminAuth = (req, res, next) => {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    return next();
  }
  const provided = req.headers['x-admin-key'] || req.query.adminKey;
  if (provided === adminKey) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized: Invalid Admin Key' });
};

// GET live dashboard overview stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    let products = [];
    let orders = [];
    let subscribers = [];

    if (isMongoConnected()) {
      [products, orders, subscribers] = await Promise.all([
        Product.find().lean(),
        Order.find().sort({ createdAt: -1 }).lean(),
        Subscriber.find().lean(),
      ]);
    } else {
      products = readData('products.json', []);
      orders = readData('orders.json', []);
      subscribers = readData('subscribers.json', []);
    }

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const lowStockProducts = products.filter((p) => (p.stockCount || 0) <= 15);
    const outOfStockCount = products.filter((p) => !p.inStock || (p.stockCount || 0) === 0).length;

    // Category breakdown
    const categoryStats = {};
    products.forEach((p) => {
      const cat = p.categoryName || p.category;
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });

    // Orders status breakdown
    const orderStatusCounts = {
      Processing: 0,
      'In Transit': 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };
    orders.forEach((o) => {
      const st = o.status || 'Processing';
      orderStatusCounts[st] = (orderStatusCounts[st] || 0) + 1;
    });

    res.json({
      success: true,
      source: isMongoConnected() ? 'mongodb' : 'json-store',
      stats: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders,
        averageOrderValue: Number(averageOrderValue.toFixed(2)),
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        outOfStockCount,
        totalSubscribers: subscribers.length,
        categoryStats,
        orderStatusCounts,
        recentOrders: orders.slice(0, 5),
        lowStockProducts: lowStockProducts.slice(0, 6),
      },
    });
 
