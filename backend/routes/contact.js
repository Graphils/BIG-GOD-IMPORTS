const express = require('express');
const router = express.Router();
const { sendContactNotification } = require('../utils/email');

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) return res.status(400).json({ success: false, message: 'All fields required.' });
    await sendContactNotification({ name, email, phone, subject, message });
    res.json({ success: true, message: 'Message sent successfully! We will respond within 24 hours.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
});

module.exports = router;
