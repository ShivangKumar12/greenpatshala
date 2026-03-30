// server/routes/lesson.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getCourseContent, updateLessonProgress } from '../controllers/lessonController';

const router = Router();

// Get all modules and lessons for a course (enrolled users only)
router.get('/course/:courseId', authenticate, getCourseContent);

// Update lesson progress
router.post('/:lessonId/progress', authenticate, updateLessonProgress);

export default router;
