import express from 'express';
import {
  getVendorDashboardController,
  getSalesChartDataController,
  getRecentOrdersController,
  getRecentReviewsController,
} from '../Controllers/Dashboard.controller.js';
import { protect, restrictTo } from '../Middleware/Auth.middleware.js';
import { bridgeProfileToVendor } from '../Middleware/profileVendorBridge.js';
import { scopeByVendor, checkVendorStatus } from '../Middleware/Vendor.middleware.js';

const router = express.Router();

// All routes require vendor authentication
router.use(protect, bridgeProfileToVendor, restrictTo('vendor_owner', 'vendor_staff'), scopeByVendor, checkVendorStatus);

// Dashboard endpoints
router.get('/overview', getVendorDashboardController);
router.get('/sales-chart', getSalesChartDataController);
router.get('/recent-orders', getRecentOrdersController);
router.get('/recent-reviews', getRecentReviewsController);

export default router;
