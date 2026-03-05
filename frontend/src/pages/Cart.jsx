const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product','name price images stock stockStatus isPreOrder expectedDate');
    res.json({ success: true, cart: cart || { items: [] } });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});

router.post('/add', protect, async (req, res) => {
  try {
    const { productId, quantity=1 } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });
    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx > -1) cart.items[idx].quantity += quantity;
    else cart.items.push({ product: productId, quantity });
    await cart.save();
    await cart.populate('items.product','name price images stock stockStatus isPreOrder expectedDate');
    res.json({ success: true, cart });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});

router.put('/update', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });
    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx > -1) {
      if (quantity <= 0) cart.items.splice(idx, 1);
      else cart.items[idx].quantity = quantity;
    }
    await cart.save();
    await cart.populate('items.product','name price images stock stockStatus isPreOrder expectedDate');
    res.json({ success: true, cart });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});

router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate({ user: req.user._id }, { $pull: { items: { product: req.params.productId } } }, { new: true }).populate('items.product','name price images stock stockStatus isPreOrder expectedDate');
    res.json({ success: true, cart });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});

router.delete('/clear', protect, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});

module.exports = router;