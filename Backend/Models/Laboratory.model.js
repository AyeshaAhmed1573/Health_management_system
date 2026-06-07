const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'CBC',
        'HbA1c',
        'Lipid Profile',
        'Liver Function Test',
        'Kidney Function Test',
        'X-Ray',
        'CT Scan',
        'MRI',
        'Ultrasound',
        'Other',
      ],
      default: 'Other',
    },
    price: { type: Number, required: true, min: 0 },
    turnaroundHours: { type: Number },
    homeCollectionAvailable: { type: Boolean, default: false },
    description: { type: String, trim: true },
  },
  { _id: true }
);

const laboratorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    labName: {
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
    homeCollection: { type: Boolean, default: false },
    homeCollectionFee: { type: Number, default: 0 },
    availableTests: [labTestSchema],
    operatingHours: {
      open: String,  // e.g. "08:00"
      close: String, // e.g. "20:00"
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

module.exports = mongoose.model('Laboratory', laboratorySchema);
