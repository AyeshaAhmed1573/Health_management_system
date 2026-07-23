import { Router } from 'express';
const router = Router();
import { register, login, getMe } from '../Controllers/Auth.controller.js';
import { protect } from '../Middleware/Auth.middleware.js';

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;