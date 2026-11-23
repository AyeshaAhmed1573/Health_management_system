import mongoose from 'mongoose';

const appointmentMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AppointmentConversation',
      required: true,
      index: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ['patient', 'doctor'],
      required: true,
    },
    senderName: { type: String, trim: true },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

appointmentMessageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.model('AppointmentMessage', appointmentMessageSchema);
