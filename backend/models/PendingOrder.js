const mongoose = require('mongoose');

const pendingOrderSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderData: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 } // auto-delete after 1 hour
});

module.exports = mongoose.model('PendingOrder', pendingOrderSchema);