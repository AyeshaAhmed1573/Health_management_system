const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'appointment_booked',
        'appointment_confirmed',
        'appointment_cancelled',
        'appointment_reminder',
        'lab_booking_confirmed',
        'lab_report_ready',
        'prescription_issued',
        'order_confirmed',
        'order_dispatched',
        'order_delivered',
        'health_reminder',
        'report_analyzed',
        'general',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // optional deep-link reference
    refModel: {
      type: String,
      enum: ['Appointment', 'LabBooking', 'MedicineOrder', 'Prescription', 'MedicalReport', null],
      default: null,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
