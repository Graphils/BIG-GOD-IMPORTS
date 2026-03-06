require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const app = express();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(mongoSanitize()); // Prevent MongoDB injection
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent HTTP parameter pollution
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many auth attempts, please try again later.' }
});
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// CORS
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
    ];
    // Allow all Vercel deployments and Railway
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.railway.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/biggod_imports')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/pre-order-cart', require('./routes/preOrderCart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/reviews', require('./routes/reviews'));

// Public delivery fees endpoint (no auth needed for checkout)
const Settings = require('./models/Settings');
const DEFAULT_DELIVERY_FEES = {
  'Greater Accra': 20, 'Ashanti': 40, 'Western': 50, 'Central': 45,
  'Eastern': 40, 'Northern': 80, 'Upper East': 90, 'Upper West': 90,
  'Volta': 55, 'Brong-Ahafo': 60, 'North East': 85, 'Savannah': 85,
  'Oti': 65, 'Bono East': 65, 'Ahafo': 60, 'Western North': 70
};
app.get('/api/delivery-fees', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'delivery_fees' });
    res.json({ success: true, fees: setting ? setting.value : DEFAULT_DELIVERY_FEES });
  } catch (err) { res.status(500).json({ success: false, message: 'Error.' }); }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`BIG-GOD IMPORTS Server running on port ${PORT}`));
module.exports = app;