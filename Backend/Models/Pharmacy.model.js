const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    pharmacyName: {
      type: String,
      required: true,
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
    },
    phone: { type: String },
    email: { type: String },
    deliveryAvailable: { type: Boolean, default: true },
    deliveryAreas: [{ type: String, trim: true }],
    deliveryFee: { type: Number, default: 0 },
    operatingHours: {
      open: String,
      close: String,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationNote: { type: String },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pharmacy', pharmacySchema);
