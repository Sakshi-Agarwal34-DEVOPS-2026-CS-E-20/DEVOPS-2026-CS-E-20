import express from 'express';
import { readData, writeData } from '../data/db.js';
import { isMongoConnected } from '../config/db.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();
const ORDERS_FILE = 'orders.json';
const PRODUCTS_FILE = 'products.json';

// Helper to generate tracking steps based on current status
function generateTrackingSteps(currentStatus, orderTime) {
  const steps = [
    { status: 'Order Placed', time: orderTime, completed: true },
    { status: 'Processing & Packaging', time: 'Pending', completed: false },
    { status: 'Shipped from Fulfillment Hub', time: 'Pending', completed: false },
    { status: 'In Transit', time: 'Pending', completed: false },
    { status: 'Out for Delivery', time: 'Pending', completed: false },
    { status: 'Delivered', time: 'Pending', completed: false },
  ];

  const statusOrder = [
    'Order Placed',
    'Processing',
    'Shipped',
    'In Transit',
    'Out for Delivery',
    'Delivered',
  ];

  const targetIndex = statusOrder.indexOf(currentStatus);
  const effectiveIndex = targetIndex >= 0 ? targetIndex : 1;

  return steps.map((step, idx) => {
    const isCompleted = idx <= effectiveIndex;
    const isCurrent = idx === effectiveIndex;
    return {
      ...step,
      completed: isCompleted,
      current: isCurrent,
      time: isCompleted && step.time === 'Pending' ? 'In Progress / Completed' : step.time,
    };
  });
}

// GET all orders
router.get('/', async (req, res) => {
  try {
    const { email, status } = req.query;

    if (isMongoConnected()) {
      const filter = {};
      if (email) {
        filter['customer.email'] = new RegExp(`^${email.trim()}$`, 'i');
      }
      if (status) {
        filter.status = new RegExp(`^${status.trim()}$`, 'i');
      }

      const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
      return res.json({
        success: true,
        count: orders.length,
        orders,
        source: 'mongodb',
      });
    }

    const orders = readData(ORDERS_FILE, []);
    let filtered = orders;
    if (email) {
      filtered = filtered.filter(
        (o) => o.customer?.email?.toLowerCase() === email.toLowerCase()
      );
    }
    if (status) {
      filtered = filtered.filter(
        (o) => o.status?.toLowerCase() === status.toLowerCase()
      );
    }

    res.json({
      success: true,
      count: filtered.length,
      orders: filtered,
      source: 'json-store',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving orders' });
  }
});

// GET single order by orderId or trackingNumber
router.get('/:orderId', async (req, res) => {
  try {
    const searchParam = req.params.orderId.trim();

    if (isMongoConnected()) {
      const order = await Order.findOne({
        $or: [
          { orderId: new RegExp(`^${searchParam}$`, 'i') },
          { trackingNumber: new RegExp(`^${searchParam}$`, 'i') },
        ],
      }).lean();

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      return res.json({ success: true, order, source: 'mongodb' });
    }

    const orders = readData(ORDERS_FILE, []);
    const order = orders.find(
      (o) =>
        o.orderId?.toLowerCase() === searchParam.toLowerCase() ||
        o.trackingNumber?.toLowerCase() === searchParam.toLowerCase()
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order, source: 'json-store' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving order' });
  }
});

// POST place new order
router.post('/', async (req, res) => {
  try {
    const { items, customer, paymentMethod, subtotal, discount, shipping, tax, total, currency, appliedCoupon } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart items are required' });
    }

    if (!customer || !customer.email || !customer.firstName) {
      return res.status(400).json({ success: false, message: 'Customer details are required' });
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-LUX-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;
    const trackingNumber = `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);
    const estimatedDelivery = deliveryDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const newOrder = {
      orderId,
      trackingNumber,
      date: formattedDate,
      items,
      subtotal: Number(subtotal) || 0,
      discount: Number(discount) || 0,
      shipping: Number(shipping) || 0,
      tax: Number(tax) || 0,
      total: Number(total) || 0,
      currency: currency || 'USD',
      customer,
      paymentMethod: paymentMethod || 'Credit Card (•••• 4242)',
      appliedCoupon: appliedCoupon || null,
      status: 'Processing',
      carrier: 'FedEx Express Priority',
      estimatedDelivery,
      trackingSteps: generateTrackingSteps('Processing', formattedDate),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    if (isMongoConnected()) {
      // Auto-decrement inventory stock in MongoDB
      for (const cartItem of items) {
        const prodId = cartItem.product?.id || cartItem.id;
        const qty = cartItem.quantity || 1;
        const prod = await Product.findOne({ id: prodId });
        if (prod) {
          const newStock = Math.max(0, (prod.stockCount || 0) - qty);
          prod.stockCount = newStock;
          prod.inStock = newStock > 0;
          await prod.save();
        }
      }

      const createdOrder = await Order.create(newOrder);

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        order: createdOrder,
        source: 'mongodb',
      });
    }

    // JSON file fallback
    const products = readData(PRODUCTS_FILE, []);
    items.forEach((cartItem) => {
      const pIdx = products.findIndex((p) => p.id === (cartItem.product?.id || cartItem.id));
      if (pIdx !== -1) {
        const currentStock = products[pIdx].stockCount || 0;
        const newStock = Math.max(0, currentStock - (cartItem.quantity || 1));
        products[pIdx].stockCount = newStock;
        products[pIdx].inStock = newStock > 0;
      }
    });
    writeData(PRODUCTS_FILE, products);

    const orders = readData(ORDERS_FILE, []);
    orders.unshift(newOrder);
    writeData(ORDERS_FILE, orders);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: newOrder,
      source: 'json-store',
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Server error processing order' });
  }
});

// PATCH update order status
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const orderIdParam = req.params.orderId.trim();

    if (isMongoConnected()) {
      const order = await Order.findOne({ orderId: new RegExp(`^${orderIdParam}$`, 'i') });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.status = status;
      order.trackingSteps = generateTrackingSteps(status, order.date);
      order.updatedAt = new Date().toISOString();
      await order.save();

      return res.json({
        success: true,
        message: `Order status updated to ${status}`,
        order,
        source: 'mongodb',
      });
    }

    const orders = readData(ORDERS_FILE, []);
    const orderIndex = orders.findIndex(
      (o) => o.orderId.toLowerCase() === orderIdParam.toLowerCase()
    );

    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const currentOrder = orders[orderIndex];
    currentOrder.status = status;
    currentOrder.trackingSteps = generateTrackingSteps(status, currentOrder.date);
    currentOrder.updatedAt = new Date().toISOString();

    orders[orderIndex] = currentOrder;
    writeData(ORDERS_FILE, orders);

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: currentOrder,
      source: 'json-store',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating order status' });
  }
});

export default router;
