const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { page=1, limit=12, category, search, sort='createdAt', order='desc', minPrice, maxPrice, inStock } = req.query;
    const query = { isActive: true };
    if (category) query.category = new RegExp(category, 'i');
    if (search) query.$or = [{ name: new RegExp(search,'i') }, { description: new RegExp(search,'i') }, { tags: { $in: [new RegExp(search,'i')] } }];
    if (minPrice || maxPrice) { query.price = {}; if (minPrice) query.price.$gte = Number(minPrice); if (maxPrice) query.price.$lte = Number(maxPrice); }
    if (inStock === 'true') query.stockStatus = { $ne: 'out_of_stock' };
    const sortObj = {};
    if (sort === 'price') sortObj.price = order === 'asc' ? 1 : -1;
    else if (sort === 'rating') sortObj['ratings.average'] = -1;
    else if (sort === 'popular') sortObj.soldCount = -1;
    else sortObj.createdAt = -1;
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortObj).skip((page-1)*limit).limit(Number(limit)).select('-__v');
    res.json({ success: true, products, total, pages: Math.ceil(total/limit), currentPage: Number(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
});

// GET /api/products/featured
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true }).limit(8);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error.' });
  }
});

// GET /api/products/categories
router.get('/categories', async (req, res) => {
  try {
    const cats = await Product.distinct('category', { isActive: true });
    res.json({ success: true, categories: cats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error.' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }], isActive: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error.' });
  }
});

module.exports = router;
