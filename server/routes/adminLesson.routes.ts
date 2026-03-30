// server/routes/adminLesson.routes.ts - FIXED WITH IMPORT
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadCourseFile } from '../middleware/uploadMiddleware';
import {
  getCourseLessonsAdmin,  // ✅ ADDED
  createLesson,
  updateLesson,
  deleteLesson,
  uploadLessonVideo,
  uploadLessonPDF,
} from '../controllers/lessonController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ✅ GET all lessons for a course (admin access)
router.get('/course/:courseId', getCourseLessonsAdmin);

// CREATE lesson
router.post('/', createLesson);

// UPDATE lesson
router.put('/:id', updateLesson);

// DELETE lesson
router.delete('/:id', deleteLesson);

// UPLOAD video file
router.post('/upload-video', uploadCourseFile.single('video'), uploadLessonVideo);

// UPLOAD PDF file
router.post('/upload-pdf', uploadCourseFile.single('pdf'), uploadLessonPDF);

export default router;
