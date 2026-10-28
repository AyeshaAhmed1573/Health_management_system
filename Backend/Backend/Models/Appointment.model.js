import mongoose from 'mongoose';

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
    durationMinutes: { type: Number, default: 30 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
    },
    reason: { type: String, trim: true },         // reason for visit
    symptoms: [{ type: String, trim: true }],
    meetingLink: { type: String },                // online consultations (video room)
    reminder24hSent: { type: Boolean, default: false },
    reminder1hSent: { type: Boolean, default: false },
    consultationNotes: { type: String },          // doctor fills after appointment
    fee: { type: Number },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', 'admin', null],
      default: null,
    },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

// A doctor's slot can only be held by one active appointment (prevents double booking)
appointmentSchema.index(
  { doctorId: 1, slotTime: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } } }
);
appointmentSchema.index({ profileId: 1, slotTime: -1 });
appointmentSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Appointment', appointmentSchema);
