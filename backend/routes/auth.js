const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/email');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// Verify reCAPTCHA
async function verifyRecaptcha(token) {
  if (!process.env.RECAPTCHA_SECRET_KEY || process.env.NODE_ENV === 'development') return true;
  try {
    const res = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`);
    return res.data.success;
  } catch { return false; }
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone, captchaToken } = req.body;
    if (!username || !email || !password) return res.status(400).json({ success: false, message: 'Username, email and password are required.' });
    if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    const captchaOk = await verifyRecaptcha(captchaToken);
    if (!captchaOk) return res.status(400).json({ success: false, message: 'CAPTCHA verification failed.' });
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(409).json({ success: false, message: existingUser.email === email ? 'Email already registered.' : 'Username already taken.' });
    const user = await User.create({ username, email, password, firstName, lastName, phone });
    try { await sendWelcomeEmail(user); } catch(e) { console.error('Welcome email failed:', e.message); }
    const token = signToken(user._id);
    res.status(201).json({ success: true, message: 'Account created successfully!', token, user: user.toJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password, captchaToken } = req.body;
    if (!emailOrUsername || !password) return res.status(400).json({ success: false, message: 'Please provide credentials.' });
    const captchaOk = await verifyRecaptcha(captchaToken);
    if (!captchaOk) return res.status(400).json({ success: false, message: 'CAPTCHA verification failed.' });
    const user = await User.findOne({ $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }] });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated. Contact support.' });
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    const token = signToken(user._id);
    res.json({ success: true, token, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { firstName, lastName, phone, address }, { new: true, runValidators: true });
    res.json({ success: true, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    user.passwordResetExpires = Date.now() + 3600000;
    await user.save({ validateBeforeSave: false });
    await sendPasswordResetEmail(user, token);
    res.json({ success: true, message: 'Password reset email sent.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not send reset email.' });
  }
});

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Token invalid or expired.' });
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Reset failed.' });
  }
});

module.exports = router;
