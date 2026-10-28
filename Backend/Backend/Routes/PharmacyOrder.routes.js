import express from 'express';
import {
  getPharmacyOrdersController,
  getPharmacyOrderByIdController,
  updateOrderStatusController,
  verifyPrescriptionController,
  getOrderStatisticsController,
} from '../Controllers/PharmacyOrder.controller.js';
import { protect, restrictTo } from '../Middleware/Auth.middleware.js';
import { scopeByVendor, checkVendorStatus, checkVendorPermission } from '../Middleware/Vendor.middleware.js';

const router = express.Router();

// All routes require vendor authentication
router.use(protect, restrictTo('vendor_owner', 'vendor_staff'), scopeByVendor, checkVendorStatus);

// Order management
router.get('/', checkVendorPermission('view_orders'), getPharmacyOrdersController);
router.get('/statistics', checkVendorPermission('view_analytics'), getOrderStatisticsController);
router.get('/:orderId', checkVendorPermission('view_orders'), getPharmacyOrderByIdController);
router.put('/:orderId/sub-orders/:subOrderId/status', checkVendorPermission('process_orders'), updateOrderStatusController);
router.put('/:orderId/sub-orders/:subOrderId/prescription', checkVendorPermission('process_orders'), verifyPrescriptionController);

export default router;
