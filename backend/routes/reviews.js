const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true }).populate('user','username').sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) return res.status(409).json({ success: false, message: 'You already reviewed this product.' });
    const review = await Review.create({ product: productId, user: req.user._id, rating, title, comment });
    res.status(201).json({ success: true, review, message: 'Review submitted for approval.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});

module.exports = router;
