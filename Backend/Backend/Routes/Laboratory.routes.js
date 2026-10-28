import { Router } from 'express';
const router = Router();
import {
  createLaboratoryProfile,
  getAllLaboratories,
  getLaboratoryById,
  getLaboratoryByUserId,
  updateLaboratoryProfile,
  addLabTest,
  updateLabTest,
  deleteLabTest,
  verifyLaboratory,
  updateLaboratoryRating,
  deleteLaboratory,
} from '../Controllers/Laboratory.controller.js';
import { protect, restrictTo, checkVerificationStatus } from '../Middleware/Auth.middleware.js';

// Public routes
router.get('/', getAllLaboratories);
router.get('/:id', getLaboratoryById);
router.get('/user/:userId', getLaboratoryByUserId);

// Protected routes (require authentication + verification status check)
router.post('/', protect, checkVerificationStatus, createLaboratoryProfile);
router.put('/:id', protect, checkVerificationStatus, updateLaboratoryProfile);
router.post('/:id/tests', protect, checkVerificationStatus, addLabTest);
router.put('/:id/tests/:testId', protect, checkVerificationStatus, updateLabTest);
router.delete('/:id/tests/:testId', protect, checkVerificationStatus, deleteLabTest);
router.put('/:id/rating', protect, checkVerificationStatus, updateLaboratoryRating);
router.delete('/:id', protect, checkVerificationStatus, deleteLaboratory);

// Admin routes (require admin role)
router.put('/:id/verify', protect, restrictTo('admin'), verifyLaboratory);

export default router;
