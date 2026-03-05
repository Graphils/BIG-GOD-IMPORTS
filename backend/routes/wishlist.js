const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const wl = await Wishlist.findOne({ user: req.user._id }).populate('products','name price images stock stockStatus ratings');
    res.json({ success: true, wishlist: wl || { products: [] } });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});

router.post('/toggle', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    let wl = await Wishlist.findOne({ user: req.user._id });
    if (!wl) wl = new Wishlist({ user: req.user._id, products: [] });
    const idx = wl.products.indexOf(productId);
    let action;
    if (idx > -1) { wl.products.splice(idx, 1); action = 'removed'; }
    else { wl.products.push(productId); action = 'added'; }
    await wl.save();
    res.json({ success: true, action, message: action === 'added' ? 'Added to wishlist.' : 'Removed from wishlist.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});

module.exports = router;
