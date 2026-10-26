import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  id: { type: String, required: true },
  author: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  date: { type: String, default: 'Just now' },
  comment: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { _id: false });

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  tagline: { type: String, default: '' },
  category: { type: String, required: true, index: true },
  categoryName: { type: String, default: '' },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discount: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
  reviewCount: { type: Number, default: 0 },
  badge: { type: String, default: '' },
  badgeType: { type: String, default: '' },
  inStock: { type: Boolean, default: true },
  stockCount: { type: Number, default: 20 },
  images: [{ type: String }],
  colors: [{
    name: { type: String },
    hex: { type: String },
  }],
  sizes: [{ type: String }],
  description: { type: String, default: '' },
  specs: { type: mongoose.Schema.Types.Mixed, default: {} },
  reviews: [reviewSchema],
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
