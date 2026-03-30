// server/controllers/courseController.ts - WITH THUMBNAIL UPLOAD & MODULES SUPPORT
import { Request, Response } from 'express';
import { db } from '../config/db';
import { courses, enrollments, modules, lessons } from '../../shared/schema'; // ✅ ADDED modules, lessons
import { and, desc, eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

/**
 * Normalize decimal fields to numbers and ensure all fields are present
 */
function normalizeCourse(c: any) {
  return {
    ...c,
    thumbnail: c.thumbnail || null,
    videoUrl: c.videoUrl || c.video_url || null,
    originalPrice: c.originalPrice ? Number(c.originalPrice) : null,
    discountPrice: c.discountPrice ? Number(c.discountPrice) : null,
    rating: c.rating ? Number(c.rating) : 0,
    isFree: Boolean(c.isFree),
    isPublished: Boolean(c.isPublished),
    isFeatured: Boolean(c.isFeatured || false),
    totalStudents: Number(c.totalStudents || c.total_students || 0),
    totalLessons: Number(c.totalLessons || c.total_lessons || 0),
    totalReviews: Number(c.totalReviews || c.total_reviews || 0),
  };
}

/**
 * GET /api/courses
 * Public endpoint - Returns all published courses
 */
export const getCourses = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { category, level, instructorId, isFree, search, featured } = req.query;

    let query = db
      .select()
      .from(courses)
      .where(eq(courses.isPublished, true))
      .orderBy(desc(courses.createdAt));

    const result = await query;
    let filtered = result;

    if (category) {
      const cat = String(category);
      filtered = filtered.filter((c) => c.category === cat);
    }

    if (level) {
      const lvl = String(level);
      filtered = filtered.filter((c) => c.level === lvl);
    }

    if (instructorId) {
      const idNum = Number(instructorId);
      if (!Number.isNaN(idNum)) {
        filtered = filtered.filter((c) => c.instructorId === idNum);
      }
    }

    if (typeof isFree !== 'undefined') {
      const flag = isFree === 'true' || isFree === '1';
      filtered = filtered.filter((c) => Boolean(c.isFree) === flag);
    }

    if (typeof featured !== 'undefined') {
      const flag = featured === 'true' || featured === '1';
      filtered = filtered.filter((c) => Boolean(c.isFeatured) === flag);
    }

    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      );
    }

    const coursesData = filtered.map(normalizeCourse);

    return res.json({
      success: true,
      count: coursesData.length,
      courses: coursesData,
    });
  } catch (error: any) {
    console.error('[GET COURSES ERROR]', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch courses. Please try again later.',
    });
  }
};

/**
 * GET /api/courses/categories
 * Returns distinct categories from published courses
 */
export const getCourseCategories = async (req: Request, res: Response): Promise<Response> => {
  try {
    const rows = await db
      .select({ category: courses.category })
      .from(courses)
      .where(eq(courses.isPublished, true))
      .groupBy(courses.category);

    const categories = rows
      .map((r) => r.category)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return res.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    console.error('[GET COURSE CATEGORIES ERROR]', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch course categories.',
    });
  }
};

/**
 * GET /api/courses/:id
 * Public endpoint - Get single course details
 */
export const getCourseById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid course ID' 
      });
    }

    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    return res.json({
      success: true,
      course: normalizeCourse(course),
    });
  } catch (error: any) {
    console.error('[GET COURSE BY ID ERROR]', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch course. Please try again later.',
    });
  }
};

// ============================================
// ✅ NEW: GET COURSE MODULES AND LESSONS
// ============================================

/**
 * GET /api/courses/:id/modules
 * Public endpoint - Get course modules and lessons structure
 * Used for course preview and curriculum display
 */
export const getCourseModules = async (req: Request, res: Response): Promise<Response> => {
  try {
    const courseId = Number(req.params.id);
    
    if (Number.isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      });
    }

    // Verify course exists
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // ✅ FIX: Use orderIndex (correct column name from schema)
    const courseModules = await db
      .select()
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(modules.orderIndex); // ✅ FIXED: was modules.order

    // ✅ FIX: Use orderIndex for lessons too
    const moduleLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, courseId))
      .orderBy(lessons.orderIndex); // ✅ FIXED: was lessons.order

    // Group lessons by module
    const modulesWithLessons = courseModules.map(module => ({
      id: module.id,
      title: module.title,
      description: module.description,
      order: module.orderIndex, // ✅ Map orderIndex to order for frontend
      isPublished: module.isPublished,
      lessons: moduleLessons
        .filter(lesson => lesson.moduleId === module.id)
        .map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          contentType: lesson.contentType,
          videoUrl: lesson.videoUrl,
          pdfUrl: lesson.pdfUrl,
          duration: lesson.duration,
          order: lesson.orderIndex, // ✅ Map orderIndex to order for frontend
          isFree: lesson.isFree,
          isPublished: lesson.isPublished,
        })),
    }));

    return res.json({
      success: true,
      count: modulesWithLessons.length,
      modules: modulesWithLessons,
    });
  } catch (error: any) {
    console.error('[GET COURSE MODULES ERROR]', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch course modules',
    });
  }
};

/**
 * GET /api/courses/:id/access
 * Protected endpoint - Check if user has access to course
 */
export const getCourseAccess = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId as number | undefined;
    const id = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      });
    }

    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);

    if (!course || !course.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.isFree) {
      return res.json({
        success: true,
        hasAccess: true,
        isFree: true,
        course: normalizeCourse(course),
      });
    }

    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(
        eq(enrollments.userId, userId), 
        eq(enrollments.courseId, id)
      ))
      .limit(1);

    const hasAccess = !!enrollment;

    return res.json({
      success: true,
      hasAccess,
      isFree: false,
      course: normalizeCourse(course),
      enrollment: enrollment || null,
    });
  } catch (error: any) {
    console.error('[GET COURSE ACCESS ERROR]', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to check course access.',
    });
  }
};

/**
 * POST /api/courses/:id/enroll
 * Protected endpoint - Enroll in a course
 */
export const enrollInCourse = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId as number | undefined;
    const id = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      });
    }

    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);

    if (!course || !course.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or not published',
      });
    }

    const [existingEnrollment] = await db
      .select()
      .from(enrollments)
      .where(and(
        eq(enrollments.userId, userId), 
        eq(enrollments.courseId, id)
      ))
      .limit(1);

    if (existingEnrollment) {
      return res.json({
        success: true,
        alreadyEnrolled: true,
        message: 'You are already enrolled in this course.',
        enrollment: existingEnrollment,
      });
    }

    if (course.isFree) {
      const [newEnrollment] = await db
        .insert(enrollments)
        .values({
          userId,
          courseId: id,
          progress: 0,
          completedLessons: 0,
        });

      return res.status(201).json({
        success: true,
        alreadyEnrolled: false,
        message: 'You have been enrolled in this free course!',
        enrollment: newEnrollment,
      });
    }

    return res.status(200).json({
      success: true,
      requiresPayment: true,
      message: 'Payment is required to enroll in this course.',
      course: {
        id: course.id,
        title: course.title,
        thumbnail: course.thumbnail,
        videoUrl: course.videoUrl || course.video_url,
        originalPrice: course.originalPrice ? Number(course.originalPrice) : null,
        discountPrice: course.discountPrice ? Number(course.discountPrice) : null,
      },
    });
  } catch (error: any) {
    console.error('[ENROLL COURSE ERROR]', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to enroll in course. Please try again later.',
    });
  }
};

/**
 * GET /api/courses/my
 * Protected endpoint - Get all courses user is enrolled in
 */
export const getMyCourses = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId as number | undefined;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const rows = await db
      .select({
        enrollmentId: enrollments.id,
        progress: enrollments.progress,
        completedLessons: enrollments.completedLessons,
        lastAccessedAt: enrollments.lastAccessedAt,
        completedAt: enrollments.completedAt,
        certificateUrl: enrollments.certificateUrl,
        course: courses,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.lastAccessedAt));

    const data = rows.map((row) => ({
      enrollmentId: row.enrollmentId,
      progress: row.progress || 0,
      completedLessons: row.completedLessons || 0,
      lastAccessedAt: row.lastAccessedAt,
      completedAt: row.completedAt,
      certificateUrl: row.certificateUrl,
      isCompleted: row.progress === 100,
      course: normalizeCourse(row.course),
    }));

    return res.json({
      success: true,
      count: data.length,
      courses: data,
    });
  } catch (error: any) {
    console.error('[GET MY COURSES ERROR]', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your courses. Please try again later.',
    });
  }
};

/**
 * GET /api/courses/featured
 * Public endpoint - Get featured courses only
 */
export const getFeaturedCourses = async (req: Request, res: Response): Promise<Response> => {
  try {
    const limit = Number(req.query.limit) || 6;

    const result = await db
      .select()
      .from(courses)
      .where(and(
        eq(courses.isPublished, true),
        eq(courses.isFeatured, true)
      ))
      .orderBy(desc(courses.totalStudents), desc(courses.rating))
      .limit(limit);

    const coursesData = result.map(normalizeCourse);

    return res.json({
      success: true,
      count: coursesData.length,
      courses: coursesData,
    });
  } catch (error: any) {
    console.error('[GET FEATURED COURSES ERROR]', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch featured courses.',
    });
  }
}

// ============================================
// ADMIN THUMBNAIL UPLOAD
// ============================================

/**
 * POST /api/admin/courses/upload-thumbnail
 * Upload thumbnail image for course
 */
export const uploadCourseThumbnail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;

    if (!userId || !['admin', 'instructor'].includes(user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and instructors can upload thumbnails',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No thumbnail file uploaded',
      });
    }

    // Validate file type (images only)
    if (!req.file.mimetype.startsWith('image/')) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed (JPG, PNG, WebP)',
      });
    }

    // Build file URL
    const fileUrl = req.file.path.replace(/\\/g, '/').replace(/^uploads/, '/uploads');

    return res.status(201).json({
      success: true,
      message: 'Thumbnail uploaded successfully',
      data: {
        thumbnailUrl: fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (error: any) {
    console.error('[UPLOAD THUMBNAIL ERROR]', error);

    // Clean up file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to upload thumbnail',
    });
  }
};
