const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @route GET /api/admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, pendingOrders, revenueResult, lowStockProducts, recentOrders] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Product.find({ stockStatus: { $in: ['low_stock', 'out_of_stock'] }, isActive: true })
        .select('name stock stockStatus images').limit(10),
      Order.find().sort({ createdAt: -1 }).limit(5)
        .populate('user', 'username email')
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    // Monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalProducts, totalOrders, pendingOrders, totalRevenue },
      lowStockProducts, recentOrders, monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data.' });
  }
};

// @route GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'user' };
    if (search) query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    res.json({ success: true, users, total });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

// @route PUT /api/admin/users/:id/toggle
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
};

// @route PUT /api/admin/products/:id/stock
exports.updateStock = async (req, res) => {
  try {
    const { stock, lowStockThreshold } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: Number(stock), ...(lowStockThreshold && { lowStockThreshold: Number(lowStockThreshold) }) },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product, message: 'Stock updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update stock.' });
  }
};
