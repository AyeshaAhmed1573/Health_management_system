import Notification from '../Models/Notification.model.js';
import User from '../Models/User.model.js';
import { sendMail } from './mailService.js';

/** Create an in-app notification; never throws. Optionally e-mails the user too. */
export async function notify(userId, { type, title, message, refModel = null, refId, email = false }) {
  try {
    const n = await Notification.create({ userId, type, title, message, refModel, refId });
    if (email) {
      const user = await User.findById(userId).select('email');
      if (user?.email) await sendMail({ to: user.email, subject: title, text: message });
    }
    return n;
  } catch (err) {
    console.error('notify failed:', err.message);
  }
}
