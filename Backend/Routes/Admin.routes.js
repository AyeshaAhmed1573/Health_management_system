import { Router } from 'express';
const router = Router();
import {
  adminSignup,
  getAllPendingApprovals,
  getAllApprovedEntities,
  getAllRejectedEntities,
  approveDoctor,
  rejectDoctor,
  approveLaboratory,
  rejectLaboratory,
  approvePharmacy,
  rejectPharmacy,
  getAdminDashboardStats,
} from '../Controllers/Admin.controller.js';
import { protect, restrictTo } from '../Middleware/Auth.middleware.js';

// Public admin signup route
router.post('/signup', adminSignup);

// Admin dashboard routes (require authentication and admin role)
router.get('/dashboard/stats', protect, restrictTo('admin'), getAdminDashboardStats);
router.get('/approvals/pending', protect, restrictTo('admin'), getAllPendingApprovals);
router.get('/approvals/approved', protect, restrictTo('admin'), getAllApprovedEntities);
router.get('/approvals/rejected', protect, restrictTo('admin'), getAllRejectedEntities);

// Doctor approval routes
router.put('/doctors/:id/approve', protect, restrictTo('admin'), approveDoctor);
router.put('/doctors/:id/reject', protect, restrictTo('admin'), rejectDoctor);

// Laboratory approval routes
router.put('/laboratories/:id/approve', protect, restrictTo('admin'), approveLaboratory);
router.put('/laboratories/:id/reject', protect, restrictTo('admin'), rejectLaboratory);

// Pharmacy approval routes
router.put('/pharmacies/:id/approve', protect, restrictTo('admin'), approvePharmacy);
router.put('/pharmacies/:id/reject', protect, restrictTo('admin'), rejectPharmacy);

export default router;
