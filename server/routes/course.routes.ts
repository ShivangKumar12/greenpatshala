// server/routes/course.routes.ts
import express from 'express';
import {
  getCourses,
  getCourseById,
  getCourseCategories,
  getCourseModules, // ✅ ADD THIS IMPORT
  getCourseAccess,
  enrollInCourse,
  getMyCourses,
} from '../controllers/courseController';
import { authenticate } from '../middleware/auth';
import { cacheResponse } from '../middleware/cacheMiddleware';

const router = express.Router();

// Public endpoints (cached)
router.get('/', cacheResponse(120), getCourses);
router.get('/categories/list', cacheResponse(300), getCourseCategories);
router.get('/:id', cacheResponse(120), getCourseById);
router.get('/:id/modules', cacheResponse(120), getCourseModules); // ✅ ADD THIS ROUTE

// Protected endpoints (require logged-in user)
router.get('/my/list', authenticate, getMyCourses);
router.get('/:id/access', authenticate, getCourseAccess);
router.post('/:id/enroll', authenticate, enrollInCourse);

export default router;
