import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role:        { type: String, enum: ['user', 'assistant'], required: true },
    content:     { type: String, required: true },
    isEmergency: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    title:         { type: String, default: 'Health Chat', trim: true },
    messages:      [messageSchema],
    isActive:      { type: Boolean, default: true },
    totalMessages: { type: Number, default: 0 },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

chatSessionSchema.pre('save', function () {
  this.totalMessages = this.messages.length;
  if (this.messages.length > 0) this.lastMessageAt = new Date();
});

chatSessionSchema.index({ userId: 1, lastMessageAt: -1 });

export default mongoose.model('ChatSession', chatSessionSchema);