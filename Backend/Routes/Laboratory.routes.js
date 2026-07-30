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
import { protect } from '../Middleware/Auth.middleware.js';

// Public routes
router.get('/', getAllLaboratories);
router.get('/:id', getLaboratoryById);
router.get('/user/:userId', getLaboratoryByUserId);

// Protected routes (require authentication)
router.post('/', protect, createLaboratoryProfile);
router.put('/:id', protect, updateLaboratoryProfile);
router.post('/:id/tests', protect, addLabTest);
router.put('/:id/tests/:testId', protect, updateLabTest);
router.delete('/:id/tests/:testId', protect, deleteLabTest);
router.put('/:id/rating', protect, updateLaboratoryRating);
router.delete('/:id', protect, deleteLaboratory);

// Admin routes (require admin role - add admin middleware later)
router.put('/:id/verify', protect, verifyLaboratory);

export default router;
