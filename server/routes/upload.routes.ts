// server/routes/upload.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadCourseFile } from '../middleware/uploadMiddleware';
import {
  uploadCourseContent,
  deleteCourseContent,
  listCourseContent,
} from '../controllers/uploadController';

const router = Router();

// Upload course content (video/pdf/asset)
router.post(
  '/course-content',
  authenticate,
  uploadCourseFile.single('file'),
  uploadCourseContent
);

// List files (optionally filter by courseId)
router.get('/course-content/list', authenticate, listCourseContent);

// Delete uploaded file by ID
router.delete('/course-content/:id', authenticate, deleteCourseContent);

export default router;
