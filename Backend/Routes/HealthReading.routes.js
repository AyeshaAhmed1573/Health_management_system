import { Router } from 'express';
const router = Router();
import {
  addHealthReading,
  getHealthReadingsByProfile,
  getHealthReadingsByUser,
  getLatestReadings,
  calculateEstimatedHbA1c,
  getChartData,
  updateHealthReading,
  deleteHealthReading,
  calculateBMI,
} from '../Controllers/HealthReading.controller.js';
import { protect } from '../Middleware/Auth.middleware.js';

// Protected routes (require authentication)
router.post('/', protect, addHealthReading);
router.get('/profile/:profileId', protect, getHealthReadingsByProfile);
router.get('/user/:userId', protect, getHealthReadingsByUser);
router.get('/profile/:profileId/latest', protect, getLatestReadings);
router.get('/profile/:profileId/hba1c', protect, calculateEstimatedHbA1c);
router.get('/profile/:profileId/chart/:type', protect, getChartData);
router.post('/profile/:profileId/calculate-bmi', protect, calculateBMI);
router.put('/:id', protect, updateHealthReading);
router.delete('/:id', protect, deleteHealthReading);

export default router;
