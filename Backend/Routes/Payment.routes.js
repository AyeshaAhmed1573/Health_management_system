import { Router } from 'express';
import { protect, restrictTo } from '../Middleware/Auth.middleware.js';
import {
  createPaymentIntent, confirmMockPayment, paymentWebhook, getTransactionHistory, getTransaction, refundTransaction,
} from '../Controllers/Payment.controller.js';

const router = Router();

// gateway callback: no user session, authenticated by signature
router.post('/webhook', paymentWebhook);

router.use(protect);
router.post('/intent', createPaymentIntent);
router.get('/history', getTransactionHistory);
router.post('/:id/confirm', confirmMockPayment);
router.post('/:id/refund', restrictTo('admin', 'super_admin'), refundTransaction);
router.get('/:id', getTransaction);

export default router;
