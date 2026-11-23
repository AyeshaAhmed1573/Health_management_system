import { Router } from 'express';
import { protect, restrictTo } from '../Middleware/Auth.middleware.js';
import { getDoctorDashboardOverviewController } from '../Controllers/DoctorDashboard.controller.js';

const router = Router();

router.get('/overview', protect, restrictTo('doctor'), getDoctorDashboardOverviewController);

export default router;
