import rateLimit from 'express-rate-limit';
import { ipKeyGenerator } from 'express-rate-limit';

export const chatRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.user?.role === 'admin',
  message: { success: false, error: 'Too many messages. Wait a few minutes.' },
});

export const sessionCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many sessions created. Continue in an existing one.' },
});

// OTP rate limiters for email verification
export const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 OTP requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many OTP requests. Please wait 15 minutes before trying again.' },
  keyGenerator: (req) => {
    // Use proper IP key generator for IPv6 compatibility
    const ip = ipKeyGenerator(req);
    return ip + '_' + (req.body?.email || 'unknown');
  },
});

export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 verification attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many verification attempts. Please wait 15 minutes before trying again.' },
  keyGenerator: (req) => {
    // Use proper IP key generator for IPv6 compatibility
    const ip = ipKeyGenerator(req);
    return ip + '_' + (req.body?.email || 'unknown');
  },
});