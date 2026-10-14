import mongoose from 'mongoose';

const commissionSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      index: true,
    },
    vendorType: {
      type: String,
      enum: ['pharmacy', 'laboratory'],
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    effectiveFrom: {
      type: Date,
      default: Date.now,
    },
    effectiveUntil: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Default commission for each vendor type
commissionSchema.index({ vendorType: 1, isActive: 1, effectiveFrom: -1 });
commissionSchema.index({ vendorId: 1, isActive: 1, effectiveFrom: -1 });

export default mongoose.model('Commission', commissionSchema);
