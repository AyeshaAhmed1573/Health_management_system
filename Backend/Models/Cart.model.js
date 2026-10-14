import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['product', 'lab_test', 'lab_package'],
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
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
      default: 1,
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
    // For lab tests/packages
    homeCollection: {
      type: Boolean,
      default: false,
    },
    scheduledDate: {
      type: Date,
    },
    scheduledTime: {
      type: String,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Cart', cartSchema);
