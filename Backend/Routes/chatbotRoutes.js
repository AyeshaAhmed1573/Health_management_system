import express from 'express';
const router = express.Router();

import chatbotController from '../Controllers/chatbotController.js';

import { protect } from '../Middleware/Auth.middleware.js';
import { chatRateLimiter, sessionCreateLimiter } from '../Middleware/rateLimiter.js';

const {
  createChatSession, getChatSessions, getChatHistory,
  sendMessage, clearMessages, deleteChatSession,
} = chatbotController;

// Optional authentication - if token provided, use it; otherwise proceed with guest user
router.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Invalid token, continue as guest
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

router.post  ('/',                        sessionCreateLimiter, createChatSession);
router.get   ('/',                        getChatSessions);
router.get   ('/:sessionId',             getChatHistory);
router.post  ('/:sessionId/message',     chatRateLimiter, sendMessage);
router.delete('/:sessionId/messages',    clearMessages);
router.delete('/:sessionId',             deleteChatSession);

export default router;