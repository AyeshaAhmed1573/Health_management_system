import { Router } from 'express';
const router = Router();
import { register, login, getMe } from '../Controllers/Auth.controller.js';
import { protect } from '../Middleware/Auth.middleware.js';

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);  // test protected route

export default router;