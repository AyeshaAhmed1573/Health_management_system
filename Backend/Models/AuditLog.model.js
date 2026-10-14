import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'vendor_approved',
        'vendor_rejected',
        'vendor_suspended',
        'vendor_reactivated',
        'prescription_verified',
        'prescription_rejected',
        'report_uploaded',
        'order_status_changed',
        'booking_status_changed',
        'payout_processed',
        'payout_paid',
        'staff_added',
        'staff_removed',
        'staff_permissions_changed',
        'product_created',
        'product_updated',
        'product_deleted',
        'test_created',
        'test_updated',
        'test_deleted',
        'package_created',
        'package_updated',
        'package_deleted',
      ],
    },
    entityType: {
      type: String,
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
    },
    previousState: {
      type: mongoose.Schema.Types.Mixed,
    },
    newState: {
      type: mongoose.Schema.Types.Mixed,
    },
    reason: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound indexes for audit log queries
auditLogSchema.index({ userId: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ vendorId: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
