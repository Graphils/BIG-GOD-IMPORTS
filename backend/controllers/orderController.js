const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const emailService = require('../utils/emailService');

// @route POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, paystackReference } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order.' });
    }

    // Validate stock and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `Product "${item.name}" is no longer available.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for "${product.name}". Only ${product.stock} left.` });
      }
      orderItems.push({ product: product._id, name: product.name, image: product.images[0]?.url, price: product.price, quantity: item.quantity });
      subtotal += product.price * item.quantity;
    }

    const shippingFee = subtotal >= 500 ? 0 : 30;
    const total = subtotal + shippingFee;

    const order = await Order.create({
      user: req.user._id, items: orderItems, subtotal, shippingFee, total,
      shippingAddress, paymentMethod,
      paymentStatus: paystackReference ? 'paid' : 'pending',
      paystackReference,
      statusHistory: [{ status: 'pending', note: 'Order placed', updatedBy: req.user._id }]
    });

    // Reduce stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, salesCount: item.quantity }
      });
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // Send emails
    await emailService.sendOrderConfirmationEmail(req.user, order);
    await emailService.sendAdminNewOrderEmail(order, req.user);

    res.status(201).json({ success: true, order, message: 'Order placed successfully.' });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order.' });
  }
};

// @route GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments({ user: req.user._id });
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
      .populate('items.product', 'name images');
    res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

// @route GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images price');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
};

// @route PUT /api/orders/:id/status (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'email username firstName');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.orderStatus = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}`, updatedBy: req.user._id });

    if (status === 'delivered') {
      order.deliveryConfirmedAt = new Date();
      await emailService.sendDeliveryConfirmedEmail(order.user, order);
    }

    await order.save();
    res.json({ success: true, order, message: `Order status updated to ${status}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
};

// @route GET /api/orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus } = req.query;
    const query = {};
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
      .populate('user', 'username email firstName lastName phone');

    res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};
