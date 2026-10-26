import mongoose from 'mongoose';

const trackingStepSchema = new mongoose.Schema({
  status: { type: String, required: true },
  time: { type: String, default: 'Pending' },
  completed: { type: Boolean, default: false },
  current: { type: Boolean, default: false },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  trackingNumber: { type: String, index: true },
  date: { type: String, required: true },
  items: { type: mongoose.Schema.Types.Mixed, required: true },
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  customer: {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, index: true },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String },
  },
  paymentMethod: { type: String, default: 'Credit Card' },
  appliedCoupon: { type: mongoose.Schema.Types.Mixed, default: null },
  status: { type: String, default: 'Processing', index: true },
  carrier: { type: String, default: 'FedEx Express Priority' },
  estimatedDelivery: { type: String },
  trackingSteps: [trackingStepSchema],
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
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

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
