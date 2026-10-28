import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.model('Message', messageSchema);
