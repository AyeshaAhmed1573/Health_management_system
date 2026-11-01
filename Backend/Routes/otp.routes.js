import express from 'express';
import { sendOTP, verifyOTP } from '../Controllers/otp.controller.js';
import { otpSendLimiter, otpVerifyLimiter } from '../Middleware/rateLimiter.js';

const router = express.Router();

// Send OTP endpoint
router.post('/send-otp', otpSendLimiter, sendOTP);

// Verify OTP endpoint
router.post('/verify-otp', otpVerifyLimiter, verifyOTP);

export default router;
