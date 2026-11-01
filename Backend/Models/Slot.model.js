import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    bookedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['lab_visit', 'home_collection'],
      default: 'lab_visit',
    },
  },
  { timestamps: true }
);

// Compound indexes for slot queries
slotSchema.index({ vendorId: 1, date: 1, isAvailable: 1 });
slotSchema.index({ vendorId: 1, date: 1, startTime: 1 });

export default mongoose.model('Slot', slotSchema);
