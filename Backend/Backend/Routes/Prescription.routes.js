import { Router } from 'express';
import { protect, restrictTo } from '../Middleware/Auth.middleware.js';
import {
  createPrescription, getProfilePrescriptions, getPrescription, shareWithPharmacy, getSharedWithPharmacy,
} from '../Controllers/Prescription.controller.js';

const router = Router();
router.use(protect);

router.post('/', restrictTo('doctor'), createPrescription);
router.get('/shared-with-me', restrictTo('pharmacy'), getSharedWithPharmacy);
router.get('/profile/:profileId', getProfilePrescriptions);
router.get('/:id', getPrescription);
router.post('/:id/share', restrictTo('patient'), shareWithPharmacy);

export default router;
