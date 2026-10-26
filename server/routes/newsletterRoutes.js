import express from 'express';
import { readData, writeData } from '../data/db.js';

const router = express.Router();
const SUBSCRIBERS_FILE = 'subscribers.json';

// POST subscribe email
router.post('/subscribe', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const subscribers = readData(SUBSCRIBERS_FILE, []);

    const existing = subscribers.find((s) => s.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.json({
        success: true,
        message: 'Welcome back! You are already subscribed to the VIP list.',
        coupon: 'WELCOME15',
      });
    }

    subscribers.push({
      email: cleanEmail,
      subscribedAt: new Date().toISOString(),
      couponAwarded: 'WELCOME15',
    });

    writeData(SUBSCRIBERS_FILE, subscribers);

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to LUMEN LUXE VIP Club! Use code WELCOME15 for 15% off.',
      coupon: 'WELCOME15',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing subscription' });
  }
});

// GET all subscribers (Admin)
router.get('/', (req, res) => {
  try {
    const subscribers = readData(SUBSCRIBERS_FILE, []);
    res.json({ success: true, count: subscribers.length, subscribers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching subscribers' });
  }
});

export default router;
