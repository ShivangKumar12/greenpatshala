// server/routes/instructor.routes.ts
import { Router } from 'express';
import {
  getAdminStats,
  getRecentCourses,
  getRecentQuizzes,
} from '../controllers/adminStatsController';
import {
  getInstructorProfile,
  updateInstructorProfile,
  changePassword,
} from '../controllers/instructorController';
import { authenticate, isInstructor } from '../middleware/auth';

const router = Router();

// ============================================
// INSTRUCTOR DASHBOARD ROUTES
// Reuse admin stats controller with role-based filtering
// ============================================

// Get instructor statistics (reuses getAdminStats from admin controller)
router.get('/stats', authenticate, isInstructor, getAdminStats);

// Get recent courses (reuses getRecentCourses from admin controller)
router.get('/courses/recent', authenticate, isInstructor, getRecentCourses);

// Get recent quizzes (reuses getRecentQuizzes from admin controller)
router.get('/quizzes/recent', authenticate, isInstructor, getRecentQuizzes);

// Profile management (instructor-specific)
router.get('/profile', authenticate, isInstructor, getInstructorProfile);
router.put('/profile', authenticate, isInstructor, updateInstructorProfile);
router.post('/change-password', authenticate, isInstructor, changePassword);

export default router;
