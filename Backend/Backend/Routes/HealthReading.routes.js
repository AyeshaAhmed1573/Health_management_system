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
import { authorizeProfileAccess, getUserId, isAdmin } from '../utils/access.js';

const deny = (res, a) => res.status(a.status).json({ success: false, error: a.reason });

// every :profileId in the path must belong to (or be readable by) the caller
router.param('profileId', async (req, res, next, id) => {
  try {
    const a = await authorizeProfileAccess(req.user, id, { write: req.method !== 'GET' });
    return a.ok ? next() : deny(res, a);
  } catch (e) { next(e); }
});

// readings are always stored under the authenticated user, never a client-supplied userId
const bindToCaller = async (req, res, next) => {
  try {
    const a = await authorizeProfileAccess(req.user, req.body?.profileId, { write: true });
    if (!a.ok) return deny(res, a);
    req.body.userId = String(a.profile.userId);
    next();
  } catch (e) { next(e); }
};
const ownUserOnly = (req, res, next) =>
  String(req.params.userId) === getUserId(req) || isAdmin(req.user) ? next() : res.status(403).json({ success: false, error: 'Not allowed' });

// Protected routes (require authentication)
router.post('/', protect, bindToCaller, addHealthReading);
router.get('/profile/:profileId', protect, getHealthReadingsByProfile);
router.get('/user/:userId', protect, ownUserOnly, getHealthReadingsByUser);
router.get('/profile/:profileId/latest', protect, getLatestReadings);
router.get('/profile/:profileId/hba1c', protect, calculateEstimatedHbA1c);
router.get('/profile/:profileId/chart/:type', protect, getChartData);
router.post('/profile/:profileId/calculate-bmi', protect, calculateBMI);
router.put('/:id', protect, updateHealthReading);
router.delete('/:id', protect, deleteHealthReading);

export default router;
