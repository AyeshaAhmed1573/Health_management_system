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
import {
  getPlatformOverviewController,
  getPlatformSalesChartController,
  getVendorPerformanceController,
  getCommissionSettingsController,
  createCommissionSettingController,
  updateCommissionSettingController,
  deleteCommissionSettingController,
  calculatePayoutsController,
  createPayoutController,
  getPayoutsController,
  updatePayoutStatusController,
  flagProductController,
  flagLabTestController,
  flagLabPackageController,
  getAllUsersController,
} from '../Controllers/AdminSuper.controller.js';
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

// Super Admin routes for vendor marketplace
router.get('/super/overview', protect, restrictTo('super_admin'), getPlatformOverviewController);
router.get('/super/sales-chart', protect, restrictTo('super_admin'), getPlatformSalesChartController);
router.get('/super/vendor-performance', protect, restrictTo('super_admin'), getVendorPerformanceController);
router.get('/super/users', protect, restrictTo('super_admin'), getAllUsersController);

// Commission management
router.get('/super/commissions', protect, restrictTo('super_admin'), getCommissionSettingsController);
router.post('/super/commissions', protect, restrictTo('super_admin'), createCommissionSettingController);
router.put('/super/commissions/:commissionId', protect, restrictTo('super_admin'), updateCommissionSettingController);
router.delete('/super/commissions/:commissionId', protect, restrictTo('super_admin'), deleteCommissionSettingController);

// Payout management
router.get('/super/payouts/calculate', protect, restrictTo('super_admin'), calculatePayoutsController);
router.post('/super/payouts', protect, restrictTo('super_admin'), createPayoutController);
router.get('/super/payouts', protect, restrictTo('super_admin'), getPayoutsController);
router.put('/super/payouts/:payoutId/status', protect, restrictTo('super_admin'), updatePayoutStatusController);

// Catalog moderation
router.put('/super/products/:productId/flag', protect, restrictTo('super_admin'), flagProductController);
router.put('/super/lab-tests/:testId/flag', protect, restrictTo('super_admin'), flagLabTestController);
router.put('/super/lab-packages/:packageId/flag', protect, restrictTo('super_admin'), flagLabPackageController);

export default router;
