// server/routes/adminCourseRoutes.ts - WITH THUMBNAIL UPLOAD
import express from 'express';
import { 
  adminGetCourses, 
  adminGetCourseById,
  adminCreateCourse, 
  adminUpdateCourse, 
  adminDeleteCourse, 
  togglePublish,
  toggleFeatured,
  toggleFree,
  quickUpdateCourse,
  updateCoursePricing,
  uploadCourseContent,
  getCourseLessons,
  deleteLesson,
  getCourseStatistics,
} from '../controllers/adminCourseController';
import { uploadCourseThumbnail } from '../controllers/courseController'; // ✅ ADD THIS IMPORT
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// ============================================
// MULTER CONFIGURATION FOR FILE UPLOADS
// ============================================

// Ensure upload directories exist
const uploadDirs = [
  'uploads/courses/pdfs',
  'uploads/courses/videos',
  'uploads/courses/thumbnails', // ✅ ADD THIS
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine upload directory based on file type
    let uploadDir = 'uploads/courses/pdfs';
    
    if (file.mimetype.startsWith('video/')) {
      uploadDir = 'uploads/courses/videos';
    } else if (file.mimetype.startsWith('image/')) { // ✅ ADD THIS
      uploadDir = 'uploads/courses/thumbnails';
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .substring(0, 50);
    
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});

// File filter - allow PDFs, videos, and images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/pdf',
    'video/mp4',
    'video/avi',
    'video/mkv',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm',
    'image/jpeg',      // ✅ ADD THIS
    'image/jpg',       // ✅ ADD THIS
    'image/png',       // ✅ ADD THIS
    'image/webp',      // ✅ ADD THIS
    'image/gif',       // ✅ ADD THIS
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only PDF, video, and image files are allowed.`));
  }
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max per file
    files: 20, // Max 20 files per request
  },
});

// ============================================
// MIDDLEWARE - Apply to all routes
// ============================================
router.use(authenticate, requireAdmin);

// ============================================
// COURSE CRUD ROUTES
// ============================================

// GET /api/admin/courses - List all courses with filters/pagination
router.get('/', adminGetCourses);

// GET /api/admin/courses/:id - Get single course by ID
router.get('/:id', adminGetCourseById);

// POST /api/admin/courses - Create new course
router.post('/', adminCreateCourse);

// PUT /api/admin/courses/:id - Update existing course
router.put('/:id', upload.single('thumbnail'), adminUpdateCourse);

// DELETE /api/admin/courses/:id - Delete course
router.delete('/:id', adminDeleteCourse);

// ============================================
// COURSE STATUS & SETTINGS TOGGLE ROUTES
// ============================================

// PATCH /api/admin/courses/:id/toggle-publish - Toggle publish status
router.patch('/:id/toggle-publish', togglePublish);

// PATCH /api/admin/courses/:id/toggle-featured - Toggle featured status
router.patch('/:id/toggle-featured', toggleFeatured);

// PATCH /api/admin/courses/:id/toggle-free - Toggle free/paid status
router.patch('/:id/toggle-free', toggleFree);

// ============================================
// QUICK UPDATE ROUTES
// ============================================

// PATCH /api/admin/courses/:id/quick-update - Update single field
router.patch('/:id/quick-update', quickUpdateCourse);

// PATCH /api/admin/courses/:id/pricing - Update pricing fields
router.patch('/:id/pricing', updateCoursePricing);

// ============================================
// ✅ NEW: THUMBNAIL UPLOAD ROUTE
// ============================================

// POST /api/admin/courses/upload-thumbnail - Upload course thumbnail
router.post('/upload-thumbnail', upload.single('thumbnail'), uploadCourseThumbnail);

// ============================================
// LESSONS MANAGEMENT ROUTES
// ============================================

// POST /api/admin/courses/:id/content/upload - Upload PDFs and Videos
router.post(
  '/:id/content/upload',
  upload.fields([
    { name: 'pdfs', maxCount: 10 },
    { name: 'videos', maxCount: 10 },
  ]),
  uploadCourseContent
);

// GET /api/admin/courses/:id/lessons - Get all lessons for a course
router.get('/:id/lessons', getCourseLessons);

// DELETE /api/admin/courses/:id/lessons/:lessonId - Delete a lesson
router.delete('/:id/lessons/:lessonId', deleteLesson);

// ============================================
// STATISTICS ROUTE
// ============================================

// GET /api/admin/courses/:id/statistics - Get course statistics
router.get('/:id/statistics', getCourseStatistics);

// ============================================
// ERROR HANDLING FOR MULTER
// ============================================
router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum allowed size is 500MB per file.',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 20 files allowed per upload.',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed',
    });
  }
  
  next();
});

export default router;
