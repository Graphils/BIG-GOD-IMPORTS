const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @route GET /api/cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price images stock stockStatus isActive discount'
    });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    // Filter out inactive products
    cart.items = cart.items.filter(item => item.product && item.product.isActive);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch cart.' });
  }
};

// @route POST /api/cart/add
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items available.` });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);
    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + quantity;
      if (newQty > product.stock) {
        return res.status(400).json({ success: false, message: `Cannot add more. Only ${product.stock} available.` });
      }
      cart.items[itemIndex].quantity = newQty;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.json({ success: true, message: 'Added to cart.', cartCount: cart.items.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add to cart.' });
  }
};

// @route PUT /api/cart/update
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.product.toString() !== productId);
    } else {
      const product = await Product.findById(productId);
      if (quantity > product.stock) {
        return res.status(400).json({ success: false, message: `Only ${product.stock} available.` });
      }
      const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);
      if (itemIndex > -1) cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    res.json({ success: true, message: 'Cart updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update cart.' });
  }
};

// @route DELETE /api/cart/remove/:productId
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
    res.json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove item.' });
  }
};

// @route DELETE /api/cart/clear
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear cart.' });
  }
};
