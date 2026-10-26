import express from 'express';
import { readData } from '../data/db.js';

const router = express.Router();

// GET live dashboard overview stats
router.get('/stats', (req, res) => {
  try {
    const products = readData('products.json', []);
    const orders = readData('orders.json', []);
    const subscribers = readData('subscribers.json', []);

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
  } catch (error) {
    console.error('Error computing admin stats:', error);
    res.status(500).json({ success: false, message: 'Error computing analytics metrics' });
  }
});

export default router;

