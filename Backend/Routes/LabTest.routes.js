import express from 'express';
import {
  createLabTestController,
  getLabTestsController,
  getLabTestByIdController,
  updateLabTestController,
  deleteLabTestController,
  createLabPackageController,
  getLabPackagesController,
  getLabPackageByIdController,
  updateLabPackageController,
  deleteLabPackageController,
  getTestCategoriesController,
} from '../Controllers/LabTest.controller.js';
import { protect, restrictTo } from '../Middleware/Auth.middleware.js';
import { bridgeProfileToVendor } from '../Middleware/profileVendorBridge.js';
import { scopeByVendor, checkVendorStatus, checkVendorPermission } from '../Middleware/Vendor.middleware.js';

const router = express.Router();

// All routes require vendor authentication
router.use(protect, bridgeProfileToVendor, restrictTo('vendor_owner', 'vendor_staff'), scopeByVendor, checkVendorStatus);

// Lab Test routes
router.post('/tests', checkVendorPermission('manage_tests'), createLabTestController);
router.get('/tests', getLabTestsController);
router.get('/tests/categories', getTestCategoriesController);
router.get('/tests/:testId', getLabTestByIdController);
router.put('/tests/:testId', checkVendorPermission('manage_tests'), updateLabTestController);
router.delete('/tests/:testId', checkVendorPermission('manage_tests'), deleteLabTestController);

// Lab Package routes
router.post('/packages', checkVendorPermission('manage_tests'), createLabPackageController);
router.get('/packages', getLabPackagesController);
router.get('/packages/:packageId', getLabPackageByIdController);
router.put('/packages/:packageId', checkVendorPermission('manage_tests'), updateLabPackageController);
router.delete('/packages/:packageId', checkVendorPermission('manage_tests'), deleteLabPackageController);

export default router;
