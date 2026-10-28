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
import { protect, restrictTo, checkVerificationStatus } from '../Middleware/Auth.middleware.js';

// Public routes
router.get('/', getAllPharmacies);
router.get('/:id', getPharmacyById);
router.get('/user/:userId', getPharmacyByUserId);

// Protected routes (require authentication + verification status check)
router.post('/', protect, checkVerificationStatus, createPharmacyProfile);
router.put('/:id', protect, checkVerificationStatus, updatePharmacyProfile);
router.post('/:id/delivery-areas', protect, checkVerificationStatus, addDeliveryArea);
router.delete('/:id/delivery-areas', protect, checkVerificationStatus, removeDeliveryArea);
router.put('/:id/rating', protect, checkVerificationStatus, updatePharmacyRating);
router.delete('/:id', protect, checkVerificationStatus, deletePharmacy);

// Admin routes (require admin role)
router.put('/:id/verify', protect, restrictTo('admin'), verifyPharmacy);

export default router;
