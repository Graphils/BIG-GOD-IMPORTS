const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  price: { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, min: 0 },
  category: { type: String, required: true, trim: true },
  subcategory: { type: String, trim: true },
  brand: { type: String, trim: true },
  sku: { type: String, unique: true },
  images: [{ url: String, publicId: String, isMain: { type: Boolean, default: false } }],
  stock: { type: Number, required: true, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  stockStatus: { type: String, enum: ['in_stock','low_stock','out_of_stock'], default: 'in_stock' },
  weight: Number,
  dimensions: { length: Number, width: Number, height: Number },
  tags: [String],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isPreOrder: { type: Boolean, default: false },
  preOrderNote: { type: String, default: '' },
  expectedDate: { type: String, default: '' },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  soldCount: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') + '-' + Date.now();
  }
  if (this.isModified('stock')) {
    if (this.stock === 0) this.stockStatus = 'out_of_stock';
    else if (this.stock <= this.lowStockThreshold) this.stockStatus = 'low_stock';
    else this.stockStatus = 'in_stock';
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);