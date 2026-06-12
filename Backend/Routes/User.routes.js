import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../Controllers/User.controller.js';
import { protect, restrictTo } from '../Middleware/Auth.middleware.js';

const router = express.Router();

router.get('/', protect, restrictTo('admin'), getAllUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, restrictTo('admin'), deleteUser);

export default router;