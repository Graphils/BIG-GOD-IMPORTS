const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');

// POST /api/payments/initialize
router.post('/initialize', protect, async (req, res) => {
  try {
    const { amount, email, orderData, callbackUrl } = req.body;

    // Initialize Paystack transaction
    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email: email || req.user.email,
      amount: Math.round(amount * 100),
      currency: 'GHS',
      metadata: { userId: req.user._id.toString() },
      channels: ['card', 'mobile_money', 'bank_transfer'],
      callback_url: callbackUrl || `${process.env.FRONTEND_URL}/payment/callback`
    }, { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' } });

    const { reference } = response.data.data;

    // Create order immediately with pending payment status
    if (orderData) {
      const { items, shippingAddress, paymentMethod, shippingCost } = orderData;

      // Get product details
      const productIds = items.map(i => i.product);
      const products = await Product.find({ _id: { $in: productIds } });

      const orderItems = items.map(i => {
        const product = products.find(p => p._id.toString() === i.product.toString());
        return {
          product: i.product,
          name: product?.name || 'Product',
          image: product?.images?.[0]?.url || '',
          price: product?.price || 0,
          quantity: i.quantity
        };
      });

      const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = shippingCost || 0;

      const order = new Order({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        paymentStatus: 'pending',
        paystackReference: reference,
        subtotal,
        shippingCost: shipping,
        total: subtotal + shipping,
        status: 'pending'
      });

      await order.save();
      console.log('Order created with reference:', reference, 'orderId:', order._id);
    }

    res.json({ success: true, data: response.data.data });
  } catch (err) {
    console.error('Paystack init error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Payment initialization failed.' });
  }
});

// GET /api/payments/verify/:reference
router.get('/verify/:reference', protect, async (req, res) => {
  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${req.params.reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    const data = response.data.data;

    if (data.status === 'success') {
      // Update the order payment status to paid
      const order = await Order.findOneAndUpdate(
        { paystackReference: req.params.reference },
        { paymentStatus: 'paid', status: 'confirmed' },
        { new: true }
      );
      console.log('Order updated to paid:', order?._id, order?.orderNumber);

      res.json({ success: true, verified: true, data, orderId: order?._id });
    } else {
      res.json({ success: false, verified: false, message: 'Payment not successful.' });
    }
  } catch (err) {
    console.error('Verify error:', err.message);
    res.status(500).json({ success: false, message: 'Verification failed.' });
  }
});

// POST /api/payments/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body)).digest('hex');
  if (hash !== req.headers['x-paystack-signature']) return res.status(401).send('Unauthorized');
  console.log('Paystack webhook:', req.body.event);
  res.sendStatus(200);
});

module.exports = router;