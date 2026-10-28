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
import { protect, restrictTo } from '../Middleware/Auth.middleware.js';

// a user may only read / clear their own notifications
const ownUserOnly = (req, res, next) =>
  String(req.params.userId) === String(req.user.id) || ['admin', 'super_admin'].includes(req.user.role)
    ? next()
    : res.status(403).json({ message: 'Not allowed' });

// Protected routes (require authentication)
router.post('/', protect, restrictTo('admin', 'super_admin'), createNotification);
router.get('/user/:userId', protect, ownUserOnly, getNotificationsByUser);
router.get('/user/:userId/unread-count', protect, ownUserOnly, getUnreadCount);
router.put('/:id/read', protect, markAsRead);
router.put('/user/:userId/read-all', protect, ownUserOnly, markAllAsRead);
router.delete('/:id', protect, deleteNotification);

export default router;
