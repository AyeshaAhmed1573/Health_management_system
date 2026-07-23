import rateLimit from 'express-rate-limit';

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