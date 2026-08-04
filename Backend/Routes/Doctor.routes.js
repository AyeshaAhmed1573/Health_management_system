import { Router } from 'express';
const router = Router();
import {
  createDoctorProfile,
  getAllDoctors,
  getDoctorById,
  getDoctorByUserId,
  updateDoctorProfile,
  updateAvailableSlots,
  verifyDoctor,
  updateDoctorRating,
  deleteDoctor,
  getDoctorsBySpecialization,
} from '../Controllers/Doctor.controller.js';
import { protect, restrictTo } from '../Middleware/Auth.middleware.js';

// Public routes
router.get('/', getAllDoctors);
router.get('/specialization/:specialization', getDoctorsBySpecialization);
router.get('/:id', getDoctorById);
router.get('/user/:userId', getDoctorByUserId);

// Protected routes (require authentication)
router.post('/', protect, createDoctorProfile);
router.put('/:id', protect, updateDoctorProfile);
router.put('/:id/slots', protect, updateAvailableSlots);
router.put('/:id/rating', protect, updateDoctorRating);
router.delete('/:id', protect, deleteDoctor);

// Admin routes (require admin role)
router.put('/:id/verify', protect, restrictTo('admin'), verifyDoctor);

export default router;
