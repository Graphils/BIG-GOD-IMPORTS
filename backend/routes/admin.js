const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Review = require('../models/Review');
const Settings = require('../models/Settings');
const { protect, adminOnly } = require('../middleware/auth');
const { sendOrderStatusEmail } = require('../utils/email');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadToCloudinary = (buffer) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({ folder: 'biggod-imports' }, (err, result) => {
    if (err) reject(err); else resolve(result);
  });
  stream.end(buffer);
});
router.use(protect, adminOnly);
// DASHBOARD STATS
router.get('/stats', async (req, res) => {
  try {
    const [totalOrders, totalProducts, totalUsers, recentOrders] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'user' }),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'firstName lastName email')
    ]);
    const revenue = await Order.aggregate([
      { $match: { status: { $in: ['confirmed','processing','shipped','delivered'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    res.json({ success: true, stats: { totalOrders, totalProducts, totalUsers, revenue: revenue[0]?.total || 0, recentOrders } });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});
// PRODUCTS
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const products = await Product.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await Product.countDocuments(query);
    res.json({ success: true, products, total, pages: Math.ceil(total / limit) });
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
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (product.images?.length) {
      for (const img of product.images) {
        if (img.publicId) await cloudinary.uploader.destroy(img.publicId).catch(() => {});
      }
    }
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});
router.delete('/products/:id/image/:publicId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    await cloudinary.uploader.destroy(decodeURIComponent(req.params.publicId)).catch(() => {});
    product.images = product.images.filter(img => img.publicId !== decodeURIComponent(req.params.publicId));
    await product.save();
    res.json({ success: true, product });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});
// ORDERS
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit)).populate('user','firstName lastName email phone');
    const total = await Order.countDocuments(query);
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
// DELETE /api/admin/orders/clear - clear all delivered/cancelled orders
router.delete('/orders/clear', async (req, res) => {
  try {
    const result = await Order.deleteMany({ status: { $in: ['delivered', 'cancelled'] } });
    res.json({ success: true, message: `${result.deletedCount} orders cleared.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to clear orders.' });
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
    const reviews = await Review.find({ product: review.product, isApproved: true });
    const avg = reviews.reduce((a,b) => a + b.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(review.product, { 'ratings.average': Math.round(avg*10)/10, 'ratings.count': reviews.length });
    res.json({ success: true, review });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});
router.delete('/reviews/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});
// DELIVERY FEES
router.put('/delivery-fees', async (req, res) => {
  try {
    const { fees } = req.body;
    await Settings.findOneAndUpdate(
      { key: 'delivery_fees' },
      { key: 'delivery_fees', value: fees },
      { upsert: true, new: true }
    );
    res.json({ success: true, fees });
  } catch (err) { res.status(500).json({ success: false, message: 'Error saving delivery fees.' }); }
});
// PRE-ORDER DELIVERY FEES
router.put('/pre-order-delivery-fees', async (req, res) => {
  try {
    const { fees } = req.body;
    await Settings.findOneAndUpdate(
      { key: 'preorder_delivery_fees' },
      { key: 'preorder_delivery_fees', value: fees },
      { upsert: true, new: true }
    );
    res.json({ success: true, fees });
  } catch (err) { res.status(500).json({ success: false, message: 'Error saving pre-order delivery fees.' }); }
});
module.exports = router;