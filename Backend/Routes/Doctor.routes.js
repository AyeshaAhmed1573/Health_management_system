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
  registerDoctor,
  upload,
} from '../Controllers/Doctor.controller.js';
import { protect, restrictTo, checkVerificationStatus } from '../Middleware/Auth.middleware.js';

// Public routes
router.get('/', getAllDoctors);
router.get('/specialization/:specialization', getDoctorsBySpecialization);
router.get('/:id', getDoctorById);
router.get('/user/:userId', getDoctorByUserId);

// Doctor registration with documents (public for signup)
router.post('/register', upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'medicalDegree', maxCount: 1 },
  { name: 'licenseCertificate', maxCount: 1 },
  { name: 'cnic', maxCount: 1 },
]), registerDoctor);

// Protected routes (require authentication + verification status check)
router.post('/', protect, checkVerificationStatus, createDoctorProfile);
router.put('/:id', protect, checkVerificationStatus, updateDoctorProfile);
router.put('/:id/slots', protect, checkVerificationStatus, updateAvailableSlots);
router.put('/:id/rating', protect, checkVerificationStatus, updateDoctorRating);
router.delete('/:id', protect, checkVerificationStatus, deleteDoctor);

// Admin routes (require admin role)
router.put('/:id/verify', protect, restrictTo('admin'), verifyDoctor);

export default router;
