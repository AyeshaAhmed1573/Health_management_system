import express from 'express';
import {
  registerVendorController,
  loginVendorController,
  getVendorProfileController,
  updateVendorProfileController,
  approveVendorController,
  rejectVendorController,
  suspendVendorController,
  reactivateVendorController,
  listVendorsController,
  getPublicVendorProfileController,
  searchApprovedVendorsController,
} from '../Controllers/Vendor.controller.js';
import { protect, restrictTo } from '../Middleware/Auth.middleware.js';
import { scopeByVendor, checkVendorStatus } from '../Middleware/Vendor.middleware.js';
import { uploadVendorDocuments, handleUploadError } from '../Middleware/upload.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', uploadVendorDocuments, handleUploadError, registerVendorController);
router.post('/login', loginVendorController);

// Public vendor search (for patients)
router.get('/public/search', searchApprovedVendorsController);
router.get('/public/:vendorId', getPublicVendorProfileController);

// Protected routes - vendor owner
router.get('/profile', protect, restrictTo('vendor_owner'), getVendorProfileController);
router.put('/profile', protect, restrictTo('vendor_owner'), scopeByVendor, checkVendorStatus, updateVendorProfileController);

// Protected routes - super admin
router.get('/admin/list', protect, restrictTo('super_admin'), listVendorsController);
router.put('/admin/:vendorId/approve', protect, restrictTo('super_admin'), approveVendorController);
router.put('/admin/:vendorId/reject', protect, restrictTo('super_admin'), rejectVendorController);
router.put('/admin/:vendorId/suspend', protect, restrictTo('super_admin'), suspendVendorController);
router.put('/admin/:vendorId/reactivate', protect, restrictTo('super_admin'), reactivateVendorController);

export default router;
