const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');
const { sendOrderConfirmationEmail } = require('../utils/email');

// POST /api/orders - Create order (called after payment success)
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, paystackReference, shippingCost=0 } = req.body;
    if (!items || !items.length) return res.status(400).json({ success: false, message: 'No items.' });
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) return res.status(400).json({ success: false, message: `Product ${item.product} not available.` });
      if (product.stock < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });
      orderItems.push({ product: product._id, name: product.name, image: product.images[0]?.url || '', price: product.price, quantity: item.quantity });
      subtotal += product.price * item.quantity;
      product.stock -= item.quantity;
      product.soldCount = (product.soldCount || 0) + item.quantity;
      if (product.stock === 0) product.stockStatus = 'out_of_stock';
      else if (product.stock <= product.lowStockThreshold) product.stockStatus = 'low_stock';
      await product.save();
    }
    const total = subtotal + Number(shippingCost);
    const order = await Order.create({
      user: req.user._id, items: orderItems, shippingAddress,
      paymentMethod, paymentStatus: 'paid', paystackReference,
      subtotal, shippingCost: Number(shippingCost), total,
      status: 'confirmed',
      statusHistory: [{ status: 'confirmed', note: 'Order placed and payment confirmed', updatedBy: req.user._id }]
    });
    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    try { await sendOrderConfirmationEmail(req.user, order); } catch(e) { console.error('Email error:', e.message); }
    res.status(201).json({ success: true, message: 'Order placed successfully!', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create order.' });
  }
});

// GET /api/orders/my-orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('items.product', 'name images');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
});

// GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate('items.product');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error.' });
  }
});

module.exports = router;
