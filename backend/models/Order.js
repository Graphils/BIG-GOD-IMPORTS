const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String, image: String, price: Number, quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    firstName: String, lastName: String, phone: String,
    street: String, city: String, region: String, country: { type: String, default: 'Ghana' }, postalCode: String
  },
  paymentMethod: { type: String, enum: ['card','mobile_money','bank_transfer'], required: true },
  paymentStatus: { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
  paymentReference: String,
  paystackReference: String,
  subtotal: Number,
  shippingCost: { type: Number, default: 0 },
  total: Number,
  status: {
    type: String,
    enum: ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'],
    default: 'pending'
  },
  statusHistory: [{
    status: String, note: String, updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, timestamp: { type: Date, default: Date.now }
  }],
  notes: String,
  deliveryConfirmedAt: Date,
  estimatedDelivery: Date
}, { timestamps: true });

orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = 'BGI-' + String(count + 1001).padStart(6,'0');
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
