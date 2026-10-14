import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['pharmacy', 'laboratory'],
      required: true,
      index: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    licenseDocumentUrl: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      province: { type: String, trim: true },
      postalCode: { type: String, trim: true },
    },
    city: {
      type: String,
      trim: true,
      index: true,
    },
    serviceArea: [{
      type: String,
      trim: true,
    }],
    contactInfo: {
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
      whatsapp: { type: String, trim: true },
    },
    operatingHours: {
      monday: { open: String, close: String, closed: { type: Boolean, default: false } },
      tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
      friday: { open: String, close: String, closed: { type: Boolean, default: false } },
      saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
      sunday: { open: String, close: String, closed: { type: Boolean, default: false } },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
    },
    suspendedReason: {
      type: String,
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    // Pharmacy-specific fields
    deliveryAvailable: {
      type: Boolean,
      default: true,
    },
    deliveryAreas: [{
      area: String,
      charge: Number,
    }],
    // Laboratory-specific fields
    homeCollectionAvailable: {
      type: Boolean,
      default: false,
    },
    homeCollectionFee: {
      type: Number,
      default: 0,
    },
    // Commission override (if different from platform default)
    commissionRate: {
      type: Number,
      min: 0,
      max: 100,
    },
    // Payout settings
    payoutDetails: {
      bankName: String,
      accountNumber: String,
      accountHolderName: String,
      ifscCode: String,
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Compound indexes for vendor queries
vendorSchema.index({ type: 1, status: 1, city: 1 });
vendorSchema.index({ type: 1, status: 1, rating: -1 });

export default mongoose.model('Vendor', vendorSchema);
