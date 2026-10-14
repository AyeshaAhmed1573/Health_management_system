import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    vendorName: {
      type: String,
      required: true,
    },
    vendorType: {
      type: String,
      enum: ['pharmacy', 'laboratory'],
      required: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCommission: {
      type: Number,
      required: true,
      min: 0,
    },
    netEarnings: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed'],
      default: 'pending',
      index: true,
    },
    processedAt: {
      type: Date,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    paidAt: {
      type: Date,
    },
    transactionId: {
      type: String,
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'upi', 'check'],
    },
    bankDetails: {
      bankName: String,
      accountNumber: String,
      accountHolderName: String,
      ifscCode: String,
    },
    notes: {
      type: String,
      trim: true,
    },
    failureReason: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound indexes for payout queries
payoutSchema.index({ vendorId: 1, status: 1, periodEnd: -1 });
payoutSchema.index({ status: 1, periodEnd: -1 });

export default mongoose.model('Payout', payoutSchema);
