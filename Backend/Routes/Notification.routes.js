import { Router } from 'express';
const router = Router();
import {
  createNotification,
  getNotificationsByUser,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from '../Controllers/Notification.controller.js';
import { protect } from '../Middleware/Auth.middleware.js';

// Protected routes (require authentication)
router.post('/', protect, createNotification);
router.get('/user/:userId', protect, getNotificationsByUser);
router.get('/user/:userId/unread-count', protect, getUnreadCount);
router.put('/:id/read', protect, markAsRead);
router.put('/user/:userId/read-all', protect, markAllAsRead);
router.delete('/:id', protect, deleteNotification);

export default router;
