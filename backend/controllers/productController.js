const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// @route GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, page = 1, limit = 12, featured, inStock } = req.query;
    const query = { isActive: true };

    if (category && category !== 'all') query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (inStock === 'true') query.stockStatus = { $ne: 'out_of_stock' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'rating') sortObj = { 'ratings.average': -1 };
    else if (sort === 'popular') sortObj = { salesCount: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortObj).skip(skip).limit(Number(limit)).select('-reviews');

    res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
};

// @route GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'username profileImage');
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product.' });
  }
};

// @route POST /api/products (Admin)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, subcategory, brand, stock, lowStockThreshold, sku, weight, tags, isFeatured, discount } = req.body;
    let images = [];

    // Handle uploaded images (base64 or URLs)
    if (req.body.images && Array.isArray(req.body.images)) {
      for (const img of req.body.images) {
        if (img.startsWith('data:')) {
          const result = await cloudinary.uploader.upload(img, {
            folder: 'biggod-imports/products',
            quality: 'auto',
            fetch_format: 'auto'
          });
          images.push({ url: result.secure_url, publicId: result.public_id, alt: name });
        } else {
          images.push({ url: img, alt: name });
        }
      }
    }

    const product = await Product.create({
      name, description, price: Number(price), originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category, subcategory, brand, stock: Number(stock) || 0,
      lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : 10,
      sku, weight, tags: tags ? tags.split(',').map(t => t.trim()) : [],
      isFeatured, discount: discount ? Number(discount) : 0, images
    });

    res.status(201).json({ success: true, product, message: 'Product created successfully.' });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
};

// @route PUT /api/products/:id (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const updates = { ...req.body };
    if (updates.price) updates.price = Number(updates.price);
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);

    // Handle new images
    if (req.body.newImages && Array.isArray(req.body.newImages)) {
      const newImages = [];
      for (const img of req.body.newImages) {
        if (img.startsWith('data:')) {
          const result = await cloudinary.uploader.upload(img, { folder: 'biggod-imports/products', quality: 'auto' });
          newImages.push({ url: result.secure_url, publicId: result.public_id, alt: product.name });
        } else {
          newImages.push({ url: img, alt: product.name });
        }
      }
      updates.images = [...(product.images || []), ...newImages];
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ success: true, product: updatedProduct, message: 'Product updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

// @route DELETE /api/products/:id (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, message: 'Product removed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};

// @route POST /api/products/:id/review
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const existingReview = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product.' });
    }

    product.reviews.push({ user: req.user._id, rating: Number(rating), comment });
    const total = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.ratings.average = total / product.reviews.length;
    product.ratings.count = product.reviews.length;
    await product.save();
    res.json({ success: true, message: 'Review added successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add review.' });
  }
};

// @route GET /api/products/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};
