import { Router } from 'express';
const router = Router();
import {
  createPharmacyProfile,
  getAllPharmacies,
  getPharmacyById,
  getPharmacyByUserId,
  updatePharmacyProfile,
  addDeliveryArea,
  removeDeliveryArea,
  verifyPharmacy,
  updatePharmacyRating,
  deletePharmacy,
} from '../Controllers/Pharmacy.controller.js';
import { protect, restrictTo } from '../Middleware/Auth.middleware.js';

// Public routes
router.get('/', getAllPharmacies);
router.get('/:id', getPharmacyById);
router.get('/user/:userId', getPharmacyByUserId);

// Protected routes (require authentication)
router.post('/', protect, createPharmacyProfile);
router.put('/:id', protect, updatePharmacyProfile);
router.post('/:id/delivery-areas', protect, addDeliveryArea);
router.delete('/:id/delivery-areas', protect, removeDeliveryArea);
router.put('/:id/rating', protect, updatePharmacyRating);
router.delete('/:id', protect, deletePharmacy);

// Admin routes (require admin role)
router.put('/:id/verify', protect, restrictTo('admin'), verifyPharmacy);

export default router;
