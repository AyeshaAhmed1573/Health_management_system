import express from 'express';
import { protect } from '../Middleware/Auth.middleware.js';
import {
  uploadReport,
  getReportFolders,
  getReportsByCategory,
  getComparisonDataController,
  getReportById,
  deleteReport,
  reanalyzeReport,
} from '../Controllers/reportController.js';

const router = express.Router();

// Apply auth protection middleware to all report routes
router.use(protect);

router.post('/', uploadReport);
router.get('/folders/:profileId', getReportFolders);
router.get('/profile/:profileId/category/:category', getReportsByCategory);
router.get('/compare/:profileId/:category', getComparisonDataController);
router.get('/:reportId', getReportById);
router.delete('/:reportId', deleteReport);
router.post('/:reportId/analyze', reanalyzeReport);

export default router;
