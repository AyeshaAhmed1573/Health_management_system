import Conversation from '../Models/Conversation.model.js';
import Message from '../Models/Message.model.js';

// CREATE CONVERSATION
export async function createConversation(req, res) {
  try {
    const { title } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const conversation = await Conversation.create({
      userId,
      title: title || 'New Conversation',
    });

    res.status(201).json({
      message: 'Conversation created successfully',
      conversation,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET ALL CONVERSATIONS FOR LOGGED-IN USER
export async function getUserConversations(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({ conversations });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET SINGLE CONVERSATION WITH MESSAGES
export async function getConversation(req, res) {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const conversation = await Conversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({ conversation, messages });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// SAVE MESSAGE
export async function saveMessage(req, res) {
  try {
    const { conversationId, sender, message } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!conversationId || !sender || !message) {
      return res.status(400).json({ message: 'Conversation ID, sender, and message are required' });
    }

    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const newMessage = await Message.create({
      conversationId,
      sender,
      message,
    });

    // Update conversation timestamp
    await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

    res.status(201).json({
      message: 'Message saved successfully',
      message: newMessage,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// UPDATE CONVERSATION TITLE
export async function updateConversation(req, res) {
  try {
    const { conversationId } = req.params;
    const { title } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, userId },
      { title },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.status(200).json({
      message: 'Conversation updated successfully',
      conversation,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// DELETE CONVERSATION
export async function deleteConversation(req, res) {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const conversation = await Conversation.findOneAndDelete({ _id: conversationId, userId });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversationId });

    res.status(200).json({ message: 'Conversation deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}
