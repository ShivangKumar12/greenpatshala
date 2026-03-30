// server/routes/adminStats.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';
import {
  getAdminStats,
  getRecentPayments,
  getRecentCourses,
  getRecentQuizzes,
} from '../controllers/adminStatsController';
import { getDashboardChartData } from '../controllers/dashboardChartsController';

const router = Router();

// All routes require admin authentication
router.use(authenticate, adminAuth);

// Stats and recent items
router.get('/stats', getAdminStats);
router.get('/charts', getDashboardChartData);
router.get('/courses/recent', getRecentCourses);
router.get('/quizzes/recent', getRecentQuizzes);
router.get('/payments/recent', getRecentPayments);

export default router;
