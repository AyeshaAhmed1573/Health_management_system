import mongoose from 'mongoose';

const labTestSchema = new mongoose.Schema(
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
    sampleType: {
      type: String,
      enum: ['blood', 'urine', 'stool', 'swab', 'tissue', 'saliva', 'other'],
      required: true,
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
    price: {
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
    referenceRanges: [{
      parameter: String,
      min: Number,
      max: Number,
      unit: String,
      normalRange: String,
    }],
    parameters: [{
      name: String,
      unit: String,
    }],
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

// Compound indexes for lab test queries
labTestSchema.index({ vendorId: 1, isActive: 1, category: 1 });
labTestSchema.index({ vendorId: 1, isActive: 1, price: 1 });
labTestSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('LabTest', labTestSchema);
