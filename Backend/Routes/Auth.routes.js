import { Router } from 'express';
const router = Router();
import { register, login, getMe } from '../Controllers/Auth.controller.js';
import { refreshTokenController, logoutController } from '../Controllers/AuthRefresh.controller.js';
import { protect, protectRefresh } from '../Middleware/Auth.middleware.js';

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

router.post('/register', optionalUpload, register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/refresh', protectRefresh, refreshTokenController);
router.post('/logout', logoutController);

export default router;