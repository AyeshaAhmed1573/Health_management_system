import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'laboratory', 'pharmacy', 'admin', 'super_admin', 'vendor_owner', 'vendor_staff'],
      default: 'patient',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otpSecret: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpiry: {
      type: Date,
      select: false,
    },
    // New fields for vendor system
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      index: true,
    },
  },
  { timestamps: true }
);

// Index for vendor staff lookups
userSchema.index({ vendorId: 1, role: 1 });

export default mongoose.model('User', userSchema);
