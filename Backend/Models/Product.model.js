import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    genericName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    images: [{
      url: String,
      publicId: String,
    }],
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    mrp: {
      type: Number,
      min: 0,
    },
    discountPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    batchNumber: {
      type: String,
      trim: true,
    },
    expiryDate: {
      type: Date,
    },
    prescriptionRequired: {
      type: Boolean,
      default: false,
    },
    isPrescriptionOnly: {
      type: Boolean,
      default: false,
    },
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
    storageConditions: {
      type: String,
      trim: true,
    },
    sideEffects: [{
      type: String,
      trim: true,
    }],
    dosageForm: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'inhaler', 'other'],
    },
    strength: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    tags: [{
      type: String,
      trim: true,
    }],
  },
  { timestamps: true }
);

// Compound indexes for product queries
productSchema.index({ vendorId: 1, isActive: 1, category: 1 });
productSchema.index({ vendorId: 1, isActive: 1, stock: 1 });
productSchema.index({ vendorId: 1, expiryDate: 1 });
productSchema.index({ name: 'text', description: 'text', genericName: 'text' });

// Note: Low stock and near expiry alerts are handled via queries, not partial filter expressions
// as they require dynamic date comparison

export default mongoose.model('Product', productSchema);
