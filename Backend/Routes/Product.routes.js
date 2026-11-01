import express from 'express';
import {
  createProductController,
  getVendorProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  updateStockController,
  getLowStockProductsController,
  getNearExpiryProductsController,
  getOutOfStockProductsController,
  getInventorySummaryController,
  getProductCategoriesController,
} from '../Controllers/Product.controller.js';
import { protect, restrictTo } from '../Middleware/Auth.middleware.js';
import { bridgeProfileToVendor } from '../Middleware/profileVendorBridge.js';
import { scopeByVendor, checkVendorStatus, checkVendorPermission } from '../Middleware/Vendor.middleware.js';
import { uploadProductImages, handleUploadError } from '../Middleware/upload.middleware.js';

const router = express.Router();

// All routes require vendor authentication
router.use(protect, bridgeProfileToVendor, restrictTo('vendor_owner', 'vendor_staff'), scopeByVendor, checkVendorStatus);

// Product CRUD
router.post('/', uploadProductImages, handleUploadError, checkVendorPermission('manage_products'), createProductController);
router.get('/', getVendorProductsController);
router.get('/categories', getProductCategoriesController);
router.get('/alerts/low-stock', checkVendorPermission('view_inventory'), getLowStockProductsController);
router.get('/alerts/near-expiry', checkVendorPermission('view_inventory'), getNearExpiryProductsController);
router.get('/alerts/out-of-stock', checkVendorPermission('view_inventory'), getOutOfStockProductsController);
router.get('/summary', checkVendorPermission('view_inventory'), getInventorySummaryController);
router.get('/:productId', getProductByIdController);
router.put('/:productId', checkVendorPermission('manage_products'), updateProductController);
router.delete('/:productId', checkVendorPermission('manage_products'), deleteProductController);
router.patch('/:productId/stock', checkVendorPermission('manage_inventory'), updateStockController);

export default router;
