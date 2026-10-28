import { Router } from 'express';
const router = Router();
import {
  createPatientProfile,
  getAllPatientProfiles,
  getPatientProfileById,
  getPatientProfileByUserId,
  updatePatientProfile,
  addAllergy,
  removeAllergy,
  addMedicalCondition,
  removeMedicalCondition,
  deletePatientProfile,
} from '../Controllers/Patient.controller.js';
import { protect } from '../Middleware/Auth.middleware.js';

// Medical data: every route requires authentication (ownership is checked in the controller)
router.get('/', protect, getAllPatientProfiles);
router.get('/user/:userId', protect, getPatientProfileByUserId);
router.get('/:id', protect, getPatientProfileById);
router.post('/', protect, createPatientProfile);
router.put('/:id', protect, updatePatientProfile);
router.post('/:id/allergies', protect, addAllergy);
router.delete('/:id/allergies', protect, removeAllergy);
router.post('/:id/conditions', protect, addMedicalCondition);
router.delete('/:id/conditions', protect, removeMedicalCondition);
router.delete('/:id', protect, deletePatientProfile);

export default router;
