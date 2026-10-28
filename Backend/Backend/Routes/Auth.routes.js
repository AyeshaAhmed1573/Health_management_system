import { Router } from 'express';
const router = Router();
import { register, login, getMe } from '../Controllers/Auth.controller.js';
import { refreshTokenController, logoutController } from '../Controllers/AuthRefresh.controller.js';
import { protect, protectRefresh } from '../Middleware/Auth.middleware.js';
import { uploadDoctorDocuments, handleUploadError } from '../Middleware/upload.middleware.js';
import { authLimiter } from '../Middleware/rateLimiter.js';
import {
  forgotPassword, resetPassword, changePassword, startEnableTwoFactor,
  confirmEnableTwoFactor, disableTwoFactor, verifyTwoFactorLogin,
} from '../Controllers/AccountSecurity.controller.js';

// Make file uploads optional by using .any() with error handling
const optionalUpload = (req, res, next) => {
  uploadDoctorDocuments.fields([
    // Doctor documents
    { name: 'licenseDocument', maxCount: 1 },
    { name: 'medicalDegreeDocument', maxCount: 1 },
    { name: 'hospitalProofDocument', maxCount: 1 },
    { name: 'clinicProofDocument', maxCount: 1 },
    { name: 'idProofDocument', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 },
    // Lab/Pharmacy documents
    { name: 'registrationDocument', maxCount: 1 },
    { name: 'addressProofDocument', maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return next(err);
    }
    next();
  });
};

router.post('/register', authLimiter, optionalUpload, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);

// password reset + optional two-factor auth
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/change-password', protect, changePassword);
router.post('/2fa/enable', protect, authLimiter, startEnableTwoFactor);
router.post('/2fa/confirm', protect, authLimiter, confirmEnableTwoFactor);
router.post('/2fa/disable', protect, authLimiter, disableTwoFactor);
router.post('/2fa/verify', authLimiter, verifyTwoFactorLogin);
router.post('/refresh', protectRefresh, refreshTokenController);
router.post('/logout', logoutController);

router.use(handleUploadError);

export default router;