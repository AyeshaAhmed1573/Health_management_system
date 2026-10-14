import mongoose from 'mongoose';

const vendorStaffSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['pharmacist', 'lab_technician', 'manager'],
      required: true,
    },
    permissions: [{
      type: String,
      enum: [
        // Pharmacy permissions
        'view_products',
        'manage_products',
        'view_orders',
        'process_orders',
        'view_inventory',
        'manage_inventory',
        // Laboratory permissions
        'view_tests',
        'manage_tests',
        'view_bookings',
        'process_bookings',
        'upload_reports',
        // Common permissions
        'view_analytics',
        'manage_staff',
        'view_settings',
        'manage_settings',
      ],
    }],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Compound index for vendor staff lookups
vendorStaffSchema.index({ vendorId: 1, status: 1 });

export default mongoose.model('VendorStaff', vendorStaffSchema);
