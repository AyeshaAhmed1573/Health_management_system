import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['patient', 'doctor'],
      required: true,
    },
    name: { type: String, trim: true },
    unreadCount: { type: Number, default: 0, min: 0 },
    lastReadAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const appointmentConversationSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true,
    },
    patientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    patientProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PatientProfile',
    },
    patientName: { type: String, trim: true },
    doctorName: { type: String, trim: true },
    participants: [participantSchema],
    lastMessageText: { type: String, default: '' },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

appointmentConversationSchema.index({ patientUserId: 1, updatedAt: -1 });
appointmentConversationSchema.index({ doctorUserId: 1, updatedAt: -1 });
appointmentConversationSchema.index({ 'participants.userId': 1 });

export default mongoose.model('AppointmentConversation', appointmentConversationSchema);
