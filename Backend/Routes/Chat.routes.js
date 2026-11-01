import { Router } from 'express';
const router = Router();
import {
  createConversation,
  getUserConversations,
  getConversation,
  saveMessage,
  updateConversation,
  deleteConversation,
} from '../Controllers/Chat.controller.js';
import { protect } from '../Middleware/Auth.middleware.js';

// Protected routes (require authentication)
router.post('/conversations', protect, createConversation);
router.get('/conversations', protect, getUserConversations);
router.get('/conversations/:conversationId', protect, getConversation);
router.post('/messages', protect, saveMessage);
router.put('/conversations/:conversationId', protect, updateConversation);
router.delete('/conversations/:conversationId', protect, deleteConversation);

export default router;
