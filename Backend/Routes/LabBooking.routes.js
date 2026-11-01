import express from 'express';
import {
  getLabBookingsController,
  getLabBookingByIdController,
  updateBookingStatusController,
  uploadReportController,
  getBookingStatisticsController,
} from '../Controllers/LabBooking.controller.js';
import { protect, restrictTo } from '../Middleware/Auth.middleware.js';
import { bridgeProfileToVendor } from '../Middleware/profileVendorBridge.js';
import { scopeByVendor, checkVendorStatus, checkVendorPermission } from '../Middleware/Vendor.middleware.js';

const router = express.Router();

// All routes require vendor authentication
router.use(protect, bridgeProfileToVendor, restrictTo('vendor_owner', 'vendor_staff'), scopeByVendor, checkVendorStatus);

// Booking management
router.get('/', checkVendorPermission('view_bookings'), getLabBookingsController);
router.get('/statistics', checkVendorPermission('view_analytics'), getBookingStatisticsController);
router.get('/:orderId', checkVendorPermission('view_bookings'), getLabBookingByIdController);
router.put('/:orderId/sub-orders/:subOrderId/status', checkVendorPermission('process_bookings'), updateBookingStatusController);
router.put('/:orderId/sub-orders/:subOrderId/report', checkVendorPermission('upload_reports'), uploadReportController);

export default router;
