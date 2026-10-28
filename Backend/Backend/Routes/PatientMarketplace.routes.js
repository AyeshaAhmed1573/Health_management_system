import express from 'express';
import {
  browseProductsController,
  getProductDetailsController,
  browseLabTestsController,
  browseLabPackagesController,
  getCartController,
  addToCartController,
  updateCartItemController,
  removeFromCartController,
  clearCartController,
  checkoutController,
  getUserOrdersController,
  getOrderByIdController,
} from '../Controllers/PatientMarketplace.controller.js';
import { protect, restrictTo } from '../Middleware/Auth.middleware.js';

const router = express.Router();

// Public routes - browsing
router.get('/products', browseProductsController);
router.get('/products/:productId', getProductDetailsController);
router.get('/lab-tests', browseLabTestsController);
router.get('/lab-packages', browseLabPackagesController);

// Protected routes - cart and checkout
router.use(protect, restrictTo('patient'));

router.get('/cart', getCartController);
router.post('/cart', addToCartController);
router.put('/cart/:itemId', updateCartItemController);
router.delete('/cart/:itemId', removeFromCartController);
router.delete('/cart', clearCartController);
router.post('/checkout', checkoutController);

// Protected routes - orders
router.get('/orders', getUserOrdersController);
router.get('/orders/:orderId', getOrderByIdController);

export default router;
