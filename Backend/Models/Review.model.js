import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabBooking',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
    },
    comment: {
      type: String,
      trim: true,
    },
    images: [{
      url: String,
      publicId: String,
    }],
    isVerified: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    flagged: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
    },
    vendorResponse: {
      type: String,
      trim: true,
    },
    vendorRespondedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Compound indexes for review queries
reviewSchema.index({ vendorId: 1, rating: -1 });
reviewSchema.index({ vendorId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, vendorId: 1 }, { unique: true }); // One review per user per vendor

export default mongoose.model('Review', reviewSchema);
