const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');

const router = express.Router();

// Initialize Razorpay instance
const getRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
};

// POST /api/payments/create-order - Create Razorpay order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(500).json({ message: 'Payment gateway not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment.' });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: 'INR',
      receipt: `mediexpress_${orderId || Date.now()}`,
      notes: {
        orderId: orderId || '',
        userId: req.user._id.toString(),
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/verify - Verify Razorpay payment signature
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return res.status(500).json({ message: 'Payment gateway not configured' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto.createHmac('sha256', key_secret).update(body).digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // Update order with payment info
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        paymentMethod: 'razorpay',
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
      });
    }

    res.json({ success: true, message: 'Payment verified successfully', paymentId: razorpay_payment_id });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/payments/key - Get Razorpay public key
router.get('/key', protect, (req, res) => {
  const key = process.env.RAZORPAY_KEY_ID;
  if (!key) {
    return res.status(500).json({ message: 'Razorpay not configured' });
  }
  res.json({ key });
});

module.exports = router;
