const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    medicineName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number },
    totalPrice: { type: Number },
    notes: { type: String },
  },
  { _id: false }
);

const medicineOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
      index: true,
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
    },
    prescriptionImageUrl: { type: String }, // manually uploaded prescription image
    items: [orderItemSchema],
    deliveryAddress: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
    },
    subtotal: { type: Number },
    deliveryFee: { type: Number, default: 0 },
    totalAmount: { type: Number },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'cod'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'cod'],
      default: 'cod',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingNote: { type: String },
    estimatedDeliveryAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

medicineOrderSchema.index({ userId: 1, orderStatus: 1 });
medicineOrderSchema.index({ pharmacyId: 1, orderStatus: 1 });

module.exports = mongoose.model('MedicineOrder', medicineOrderSchema);
