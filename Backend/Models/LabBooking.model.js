const mongoose = require('mongoose');

const bookedTestSchema = new mongoose.Schema(
  {
    testId: { type: mongoose.Schema.Types.ObjectId },
    testName: { type: String, required: true },
    category: { type: String },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const labBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PatientProfile',
      required: true,
    },
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laboratory',
      required: true,
      index: true,
    },
    tests: {
      type: [bookedTestSchema],
      required: true,
      validate: [arr => arr.length > 0, 'At least one test must be booked'],
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    homeCollection: {
      type: Boolean,
      default: false,
    },
    collectionAddress: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'sample_collected', 'processing', 'completed', 'cancelled'],
      default: 'pending',
    },
    totalAmount: { type: Number },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalReport',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

labBookingSchema.index({ labId: 1, scheduledAt: 1 });
labBookingSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('LabBooking', labBookingSchema);
