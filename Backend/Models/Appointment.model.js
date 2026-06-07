const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
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
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['in_person', 'online'],
      required: true,
    },
    slotTime: {
      type: Date,
      required: true,
    },
    // durationMinutes: {
    //   type: Number,
    //   default: 30,
    // },
    status: {         
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
    },
    reason: { type: String, trim: true },         // reason for visit
    symptoms: [{ type: String, trim: true }],
    meetingLink: { type: String },                // for online consultations
    consultationNotes: { type: String },          // doctor fills after appointment
    fee: { type: Number },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', null],
      default: null,
    },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, slotTime: 1 });
appointmentSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
