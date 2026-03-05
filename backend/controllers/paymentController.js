const axios = require('axios');
const crypto = require('crypto');
const Order = require('../models/Order');
const PendingOrder = require('../models/PendingOrder');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

exports.initializePayment = async (req, res) => {
  try {
    const { email, amount, orderData, callbackUrl } = req.body;
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: Math.round(amount * 100),
        currency: 'GHS',
        callback_url: callbackUrl || `${process.env.FRONTEND_URL}/payment/callback`,
        metadata: { userId: req.user._id.toString() },
        channels: ['card', 'mobile_money', 'bank_transfer'],
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' } }
    );
    const { reference } = response.data.data;
    console.log('Saving PendingOrder for reference:', reference);
    const pending = await PendingOrder.findOneAndUpdate(
      { reference },
      { reference, userId: req.user._id, orderData },
      { upsert: true, new: true }
    );
    console.log('PendingOrder saved:', !!pending?.orderData);
    res.json({ success: true, data: response.data.data });
  } catch (error) {
    console.error('Paystack init error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Payment initialization failed.' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${req.params.reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );
    const { data } = response.data;
    if (data.status === 'success') {
      const pending = await PendingOrder.findOne({ reference: req.params.reference });
      const orderData = pending ? pending.orderData : null;
      console.log('PendingOrder found:', !!pending, 'orderData:', JSON.stringify(orderData));
      const order = await Order.findOne({ paystackReference: req.params.reference });
      if (order) {
        order.paymentStatus = 'paid';
        order.paystackTransactionId = data.id.toString();
        await order.save();
      }
      res.json({ success: true, verified: true, data, orderData });
    } else {
      res.json({ success: true, verified: false, data });
    }
  } catch (error) {
    console.error('Verify error:', error.message);
    res.status(500).json({ success: false, message: 'Payment verification failed.' });
  }
};

exports.webhook = async (req, res) => {
  try {
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(req.body).digest('hex');
    if (hash !== req.headers['x-paystack-signature']) return res.status(400).json({ message: 'Invalid signature' });
    const event = JSON.parse(req.body);
    if (event.event === 'charge.success') {
      await Order.findOneAndUpdate(
        { paystackReference: event.data.reference },
        { paymentStatus: 'paid', paystackTransactionId: event.data.id.toString() }
      );
    }
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
};