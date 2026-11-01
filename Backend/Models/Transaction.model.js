import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'PatientProfile' },
    kind: { type: String, enum: ['appointment', 'lab_booking', 'pharmacy_order'], required: true },
    refId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'PKR' },
    method: { type: String, enum: ['card', 'jazzcash', 'easypaisa', 'bank_transfer', 'online'], default: 'online' },
    provider: { type: String, default: 'mock' },
    providerRef: { type: String },
    status: { type: String, enum: ['pending', 'succeeded', 'failed', 'refunded'], default: 'pending', index: true },
    description: { type: String },
    failureReason: { type: String },
    paidAt: { type: Date },
    refundedAt: { type: Date },
  },
  { timestamps: true }
);

// at most one open/succeeded payment per payable item
transactionSchema.index(
  { kind: 1, refId: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'succeeded'] } } }
);

export default mongoose.model('Transaction', transactionSchema);
