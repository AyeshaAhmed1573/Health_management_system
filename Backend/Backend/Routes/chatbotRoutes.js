import express from 'express';
import jwt from 'jsonwebtoken';
import chatbotController from '../Controllers/chatbotController.js';
import { chatRateLimiter, sessionCreateLimiter } from '../Middleware/rateLimiter.js';

const router = express.Router();

const {
  createChatSession, getChatSessions, getChatHistory,
  sendMessage, clearMessages, deleteChatSession,
} = chatbotController;

// Authentication middleware for chatbot session routes (handles Bearer token, cookies, or guest fallback)
router.use((req, res, next) => {
  let token = req.cookies?.token;
  const authHeader = req.headers.authorization;

  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = decoded;
    } catch (err) {
      req.user = { id: null, role: 'guest' };
    }
  } else {
    req.user = { id: null, role: 'guest' };
  }

  // Set consistent guest ID from header if provided
  const guestIdHeader = req.headers['x-guest-id'];
  if (guestIdHeader && !req.user?.id) {
    req.user.id = guestIdHeader;
  }

  next();
});

router.post('/', sessionCreateLimiter, createChatSession);
router.get('/', getChatSessions);
router.get('/:sessionId', getChatHistory);
router.post('/:sessionId/message', chatRateLimiter, sendMessage);
router.delete('/:sessionId/messages', clearMessages);
router.delete('/:sessionId', deleteChatSession);

export default router;