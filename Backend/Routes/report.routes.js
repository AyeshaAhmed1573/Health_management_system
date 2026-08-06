import express from 'express';
import multer from 'multer';
import { protect } from '../Middleware/Auth.middleware.js';
import {
  uploadReport,
  getReportFolders,
  getReportsByCategory,
  getComparisonDataController,
  getReportById,
  deleteReport,
  reanalyzeReport,
  updateReportValues,
  getReportsByTestType,
  getComparisonByTestType,
} from '../Controllers/reportController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
    }
  },
});

// Apply auth protection middleware to all report routes
router.use(protect);

router.post('/', upload.single('file'), uploadReport);
router.get('/folders/:profileId', getReportFolders);
router.get('/profile/:profileId/category/:category', getReportsByCategory);
router.get('/compare/:profileId/:category', getComparisonDataController);
router.get('/folder/:profileId/:testType', getReportsByTestType);
router.get('/compare/:profileId/:testType', (req, res, next) => {
  console.log('=== ROUTE HIT: /compare/:profileId/:testType ===');
  console.log('Params:', req.params);
  next();
}, getComparisonByTestType);
router.get('/:reportId', getReportById);
router.patch('/:id/values', updateReportValues);
router.delete('/:reportId', deleteReport);
router.post('/:reportId/analyze', reanalyzeReport);

export default router;
