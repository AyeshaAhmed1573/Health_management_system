import Notification from '../Models/Notification.model.js';

// CREATE NOTIFICATION
export async function createNotification(req, res) {
  try {
    const { userId, type, title, message, refModel, refId } = req.body;

    const targetUserId = userId || req.user?.id || req.user?._id;
    if (!targetUserId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const notification = await Notification.create({
      userId: targetUserId,
      type,
      title,
      message,
      refModel,
      refId,
    });

    res.status(201).json({
      message: 'Notification created successfully',
      notification,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET NOTIFICATIONS BY USER
export async function getNotificationsByUser(req, res) {
  try {
    const { userId } = req.params;
    const { unreadOnly, limit = 50 } = req.query;

    const filter = { userId };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// MARK NOTIFICATION AS READ
export async function markAsRead(req, res) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    res.status(200).json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// MARK ALL NOTIFICATIONS AS READ
export async function markAllAsRead(req, res) {
  try {
    const { userId } = req.params;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// DELETE NOTIFICATION
export async function deleteNotification(req, res) {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET UNREAD COUNT
export async function getUnreadCount(req, res) {
  try {
    const { userId } = req.params;

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({ unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}
