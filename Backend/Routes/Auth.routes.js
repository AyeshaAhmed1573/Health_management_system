import { Router } from 'express';
const router = Router();
import { register, login, getMe } from '../Controllers/Auth.controller.js';
import { refreshTokenController, logoutController } from '../Controllers/AuthRefresh.controller.js';
import { protect, protectRefresh } from '../Middleware/Auth.middleware.js';

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/refresh', protectRefresh, refreshTokenController);
router.post('/logout', logoutController);

export default router;