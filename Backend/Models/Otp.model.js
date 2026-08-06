import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
    length: 6,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: { expires: 300 }, // TTL index: auto-delete after 5 minutes (300 seconds)
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient lookups
otpSchema.index({ email: 1, verified: 1 });

export default mongoose.model('Otp', otpSchema);
