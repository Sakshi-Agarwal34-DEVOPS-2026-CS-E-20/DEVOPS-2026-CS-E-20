import express from 'express';
import { readData } from '../data/db.js';

const router = express.Router();
const COUPONS_FILE = 'coupons.json';

// GET all active coupons
router.get('/', (req, res) => {
  try {
    const coupons = readData(COUPONS_FILE, {});
    const activeCoupons = Object.values(coupons).filter((c) => c.active !== false);
    res.json({ success: true, coupons: activeCoupons });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving coupons' });
  }
});

// POST validate coupon code
router.post('/validate', (req, res) => {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupons = readData(COUPONS_FILE, {});
    const coupon = coupons[cleanCode];

    if (!coupon || coupon.active === false) {
      return res.status(404).json({ success: false, message: `Coupon code "${code}" is invalid or expired` });
    }

    if (coupon.minSpend && Number(subtotal) < coupon.minSpend) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${cleanCode}" requires a minimum spend of $${coupon.minSpend}`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountPercent) {
      discountAmount = (Number(subtotal) * coupon.discountPercent) / 100;
    } else if (coupon.discountAmount) {
      discountAmount = Math.min(coupon.discountAmount, Number(subtotal));
    }

    res.json({
      success: true,
      valid: true,
      code: cleanCode,
      coupon,
      discountAmount: Number(discountAmount.toFixed(2)),
      message: `Coupon "${cleanCode}" applied successfully!`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error validating coupon' });
  }
});

export default router;
