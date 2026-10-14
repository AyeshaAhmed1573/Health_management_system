import express from 'express';
import {
  inviteStaffController,
  getVendorStaffController,
  getStaffByIdController,
  updateStaffPermissionsController,
  updateStaffStatusController,
  removeStaffController,
  loginStaffController,
} from '../Controllers/VendorStaff.controller.js';
import { protect, restrictTo } from '../Middleware/Auth.middleware.js';
import { scopeByVendor, checkVendorStatus, checkVendorPermission } from '../Middleware/Vendor.middleware.js';

const router = express.Router();

// Public route
router.post('/login', loginStaffController);

// Protected routes - vendor owner and staff
router.get('/', protect, restrictTo('vendor_owner', 'vendor_staff'), scopeByVendor, checkVendorStatus, getVendorStaffController);
router.get('/:staffId', protect, restrictTo('vendor_owner', 'vendor_staff'), scopeByVendor, checkVendorStatus, getStaffByIdController);

// Protected routes - vendor owner only
router.post('/invite', protect, restrictTo('vendor_owner'), scopeByVendor, checkVendorStatus, checkVendorPermission('manage_staff'), inviteStaffController);
router.put('/:staffId/permissions', protect, restrictTo('vendor_owner'), scopeByVendor, checkVendorStatus, checkVendorPermission('manage_staff'), updateStaffPermissionsController);
router.put('/:staffId/status', protect, restrictTo('vendor_owner'), scopeByVendor, checkVendorStatus, checkVendorPermission('manage_staff'), updateStaffStatusController);
router.delete('/:staffId', protect, restrictTo('vendor_owner'), scopeByVendor, checkVendorStatus, checkVendorPermission('manage_staff'), removeStaffController);

export default router;
