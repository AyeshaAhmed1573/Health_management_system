import mongoose from 'mongoose';

const labPackageSchema = new mongoose.Schema(
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
    code: {
      type: String,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    tests: [{
      testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabTest',
        required: true,
      },
      testName: {
        type: String,
        required: true,
      },
      includedPrice: {
        type: Number,
        required: true,
      },
    }],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    discountPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    sampleType: {
      type: String,
      enum: ['blood', 'urine', 'stool', 'swab', 'tissue', 'saliva', 'mixed', 'other'],
    },
    preparationInstructions: {
      type: String,
      trim: true,
    },
    fastingRequired: {
      type: Boolean,
      default: false,
    },
    fastingHours: {
      type: Number,
      min: 0,
    },
    turnaroundHours: {
      type: Number,
      required: true,
      min: 0,
    },
    homeCollectionAvailable: {
      type: Boolean,
      default: false,
    },
    homeCollectionFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    validUntil: {
      type: Date,
    },
    maxTests: {
      type: Number,
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

// Compound indexes for lab package queries
labPackageSchema.index({ vendorId: 1, isActive: 1 });
labPackageSchema.index({ vendorId: 1, isActive: 1, price: 1 });
labPackageSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('LabPackage', labPackageSchema);
