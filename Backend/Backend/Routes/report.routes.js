import express from 'express';
import multer from 'multer';
import { protect } from '../Middleware/Auth.middleware.js';
import MedicalReport from '../Models/MedicalReport.model.js';
import { authorizeProfileAccess, getUserId } from '../utils/access.js';
import { createAuditLog } from '../Services/auditLogService.js';
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
    cb(null, 'uploads/');  // created at startup in server.js
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

// ---------------------------------------------------------------------------
// Access control (SRS 5.1): a report is only visible to the account that owns
// the profile (self/caregiver), admins, and doctors with an appointment for it.
// ---------------------------------------------------------------------------
const deny = (res, a) => res.status(a.status).json({ success: false, error: a.reason });

// every :profileId in a path is checked before any handler runs
router.param('profileId', async (req, res, next, profileId) => {
  try {
    const access = await authorizeProfileAccess(req.user, profileId, { write: req.method !== 'GET' });
    if (!access.ok) return deny(res, access);
    next();
  } catch (err) {
    next(err);
  }
});

// :reportId / :id -> look the report up and check its profile
const guardReport = (write) => async (req, res, next) => {
  try {
    const report = await MedicalReport.findById(req.params.reportId || req.params.id).select('profileId');
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    const access = await authorizeProfileAccess(req.user, report.profileId, { write });
    if (!access.ok) return deny(res, access);
    createAuditLog({
      userId: getUserId(req),
      action: write && req.method === 'DELETE' ? 'report_deleted' : 'report_viewed',
      entityType: 'MedicalReport',
      entityId: report._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    next();
  } catch (err) {
    next(err);
  }
};

// uploads: the target profile comes from the multipart body
const guardUploadTarget = async (req, res, next) => {
  try {
    const access = await authorizeProfileAccess(req.user, req.body?.profileId, { write: true });
    if (!access.ok) return deny(res, access);
    next();
  } catch (err) {
    next(err);
  }
};

// '/compare/:profileId/:x' used to be registered twice with the same pattern, so the
// second handler (test type) could never run. Dispatch on whether :x is a category.
const CATEGORIES = new Set(MedicalReport.schema.path('category').enumValues);
const compareDispatcher = (req, res, next) => {
  const x = req.params.profileId && (req.params.category ?? req.params.testType);
  if (CATEGORIES.has(x)) return getComparisonDataController(req, res, next);
  return getComparisonByTestType(req, res, next);
};

router.post('/', upload.single('file'), guardUploadTarget, uploadReport);
router.get('/folders/:profileId', getReportFolders);
router.get('/profile/:profileId/category/:category', getReportsByCategory);
router.get('/folder/:profileId/:testType', getReportsByTestType);
router.get('/compare/:profileId/:category', (req, res, next) => {
  req.params.testType = req.params.category;
  compareDispatcher(req, res, next);
});
router.get('/:reportId', guardReport(false), getReportById);
router.patch('/:id/values', guardReport(true), updateReportValues);
router.delete('/:reportId', guardReport(true), deleteReport);
router.post('/:reportId/analyze', guardReport(true), reanalyzeReport);

export default router;
