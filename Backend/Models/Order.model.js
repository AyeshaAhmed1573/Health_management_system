import mongoose from 'mongoose';

const subOrderItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['product', 'lab_test', 'lab_package'],
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    labTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTest',
    },
    labPackageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabPackage',
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    prescriptionRequired: {
      type: Boolean,
      default: false,
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
    },
    prescriptionVerified: {
      type: Boolean,
      default: false,
    },
    prescriptionVerifiedAt: {
      type: Date,
    },
    prescriptionVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    prescriptionRejectionReason: {
      type: String,
    },
  },
  { _id: false }
);

const subOrderSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    vendorName: {
      type: String,
      required: true,
    },
    vendorType: {
      type: String,
      enum: ['pharmacy', 'laboratory'],
      required: true,
    },
    items: [subOrderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    homeCollectionFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    vendorEarnings: {
      type: Number,
      required: true,
      min: 0,
    },
    // Pharmacy-specific status
    orderStatus: {
      type: String,
      enum: ['placed', 'verified', 'packed', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
    // Laboratory-specific status
    bookingStatus: {
      type: String,
      enum: ['booked', 'sample_collected', 'processing', 'report_ready', 'cancelled'],
      default: 'booked',
    },
    // Common fields
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'cod'],
    },
    paymentId: {
      type: String,
    },
    // Delivery/Collection details
    deliveryAddress: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
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
    scheduledDate: {
      type: Date,
    },
    scheduledTime: {
      type: String,
    },
    // Tracking
    trackingNumber: {
      type: String,
    },
    estimatedDeliveryAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    // Report for lab bookings
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalReport',
    },
    reportUploadedAt: {
      type: Date,
    },
    reportUploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Status history
    statusHistory: [{
      status: String,
      timestamp: { type: Date, default: Date.now },
      note: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    }],
    // Cancellation
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellationReason: {
      type: String,
    },
    // Payout
    payoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payout',
    },
    payoutStatus: {
      type: String,
      enum: ['pending', 'processed', 'paid'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Compound indexes for sub-order queries
subOrderSchema.index({ vendorId: 1, orderStatus: 1 });
subOrderSchema.index({ vendorId: 1, bookingStatus: 1 });
subOrderSchema.index({ vendorId: 1, payoutStatus: 1 });

const orderSchema = new mongoose.Schema(
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
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    subOrders: [subOrderSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCommission: {
      type: Number,
      required: true,
      min: 0,
    },
    totalDeliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalHomeCollectionFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'cod'],
    },
    paymentId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound indexes for order queries
orderSchema.index({ userId: 1, status: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);
