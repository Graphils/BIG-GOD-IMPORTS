const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Review = require('../models/Review');
const Settings = require('../models/Settings');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const { sendOrderStatusEmail } = require('../utils/email');

router.use(protect, adminOnly);

const DEFAULT_DELIVERY_FEES = {
  'Greater Accra': 20,
  'Ashanti': 40,
  'Western': 50,
  'Central': 45,
  'Eastern': 40,
  'Northern': 80,
  'Upper East': 90,
  'Upper West': 90,
  'Volta': 55,
  'Brong-Ahafo': 60,
  'North East': 85,
  'Savannah': 85,
  'Oti': 65,
  'Bono East': 65,
  'Ahafo': 60,
  'Western North': 70
};

// UPDATE delivery fees (admin only)
router.put('/delivery-fees', async (req, res) => {
  try {
    const { fees } = req.body;
    await Settings.findOneAndUpdate(
      { key: 'delivery_fees' },
      { key: 'delivery_fees', value: fees },
      { upsert: true, new: true }
    );
    res.json({ success: true, fees });
  } catch (err) { res.status(500).json({ success: false, message: 'Error saving fees.' }); }
});

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totalOrders, totalProducts, totalUsers, revenue] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'user' }),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }])
    ]);
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user','username email');
    const lowStockProducts = await Product.find({ stockStatus: { $in: ['low_stock','out_of_stock'] }, isActive: true }).limit(10);
    res.json({ success: true, stats: {
      totalOrders, totalProducts, totalUsers,
      totalRevenue: revenue[0]?.total || 0,
      recentOrders, lowStockProducts
    }});
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching stats.' });
  }
});

// PRODUCT MANAGEMENT
router.get('/products', async (req, res) => {
  try {
    const { page=1, limit=20, search, category } = req.query;
    const query = { isActive: true };
    if (search) query.name = new RegExp(search,'i');
    if (category) query.category = category;
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit));
    res.json({ success: true, products, total, pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});

router.post('/products', upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, shortDescription, price, comparePrice, category, subcategory, brand, stock, lowStockThreshold, tags, isFeatured, weight, isPreOrder, preOrderNote, expectedDate } = req.body;
    if (!name || !price || !category || !description) return res.status(400).json({ success: false, message: 'Name, price, category, description required.' });
    if (name?.length > 200 || description?.length > 5000) return res.status(400).json({ success: false, message: 'Input too long.' });
    const images = [];
    if (req.files && req.files.length) {
      for (let i = 0; i < req.files.length; i++) {
        const result = await uploadToCloudinary(req.files[i].buffer);
        images.push({ url: result.secure_url, publicId: result.public_id, isMain: i === 0 });
      }
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-') + '-' + Date.now();
    const sku = 'BGI-' + Date.now();
    const product = await Product.create({
      name, description, shortDescription, price: Number(price), comparePrice: comparePrice ? Number(comparePrice) : undefined,
      category, subcategory, brand, images, stock: Number(stock)||0,
      lowStockThreshold: Number(lowStockThreshold)||5, tags: tags ? tags.split(',').map(t=>t.trim()) : [],
      isFeatured: isFeatured === 'true', weight: weight ? Number(weight) : undefined,
      isPreOrder: isPreOrder === 'true', preOrderNote: preOrderNote || '', expectedDate: expectedDate || '',
      slug, sku
    });
    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
});

router.put('/products/:id', upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    const updates = { ...req.body };
    if (updates.price) updates.price = Number(updates.price);
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);
    if (updates.tags && typeof updates.tags === 'string') updates.tags = updates.tags.split(',').map(t=>t.trim());
    if (updates.isFeatured !== undefined) updates.isFeatured = updates.isFeatured === 'true' || updates.isFeatured === true;
    if (updates.isPreOrder !== undefined) updates.isPreOrder = updates.isPreOrder === 'true' || updates.isPreOrder === true;
    if (req.files && req.files.length) {
      const newImages = [];
      for (let i = 0; i < req.files.length; i++) {
        const result = await uploadToCloudinary(req.files[i].buffer);
        newImages.push({ url: result.secure_url, publicId: result.public_id, isMain: i === 0 && !product.images.length });
      }
      updates.images = [...product.images, ...newImages];
    }
    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
});

router.patch('/products/:id/stock', async (req, res) => {
  try {
    const { stock, lowStockThreshold } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Not found.' });
    if (stock !== undefined) product.stock = Number(stock);
    if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);
    await product.save();
    res.json({ success: true, product });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, message: 'Product deactivated.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});

// ORDER MANAGEMENT
router.get('/orders', async (req, res) => {
  try {
    const { page=1, limit=20, status } = req.query;
    const query = status ? { status } : {};
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query).sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit)).populate('user','username email phone');
    res.json({ success: true, orders, total, pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status, note, shippingCost } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required.' });
    const order = await Order.findById(req.params.id).populate('user','email username firstName');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    order.status = status;
    order.statusHistory.push({ status, note: note || '', updatedBy: req.user._id });
    if (status === 'delivered') order.deliveryConfirmedAt = new Date();
    if (shippingCost !== undefined) {
      order.shippingCost = Number(shippingCost);
      order.total = order.subtotal + Number(shippingCost);
    }
    await order.save();
    res.json({ success: true, order });
    // Send email after response (non-blocking)
    sendOrderStatusEmail(order.user, order, status).catch(e => console.error('Email err:', e.message));
  } catch (err) {
    console.error('Order update error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error updating order.' });
  }
});

// USER MANAGEMENT
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 }).select('-password');
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});

// REVIEWS
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: false }).populate('user','username').populate('product','name');
    res.json({ success: true, reviews });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});

router.patch('/reviews/:id/approve', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Not found.' });
    // Update product rating
    const reviews = await Review.find({ product: review.product, isApproved: true });
    const avg = reviews.reduce((a,b) => a + b.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(review.product, { 'ratings.average': Math.round(avg*10)/10, 'ratings.count': reviews.length });
    res.json({ success: true, review });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});

// DELETE /api/admin/orders/clear - clear all delivered/cancelled orders
router.delete('/orders/clear', async (req, res) => {
  try {
    const result = await Order.deleteMany({ status: { $in: ['delivered', 'cancelled'] } });
    res.json({ success: true, message: `${result.deletedCount} orders cleared.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to clear orders.' });
  }
});

module.exports = router;