// server/controllers/lessonController.ts - COMPLETE PRODUCTION READY
import { Request, Response } from 'express';
import { db } from '../config/db';
import { modules, lessons, lessonProgress, enrollments, courses, users } from '../../shared/schema';
import { eq, and, asc, or } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { generateCertificateForUser } from './certificateController';

// ============================================
// STUDENT-FACING ENDPOINTS
// ============================================

/**
 * GET /api/lessons/course/:courseId
 * Get all modules and lessons for a course (for enrolled users)
 */
export const getCourseContent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId as number | undefined;
    const courseId = Number(req.params.courseId);

    console.log('[GET COURSE CONTENT] Request:', { userId, courseId });

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (Number.isNaN(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID' });
    }

    // Check enrollment
    let [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
      .limit(1);

    console.log('[GET COURSE CONTENT] Enrollment found:', !!enrollment);

    if (!enrollment) {
      // Auto-enroll for free courses
      const [courseCheck] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
      if (courseCheck && courseCheck.isFree) {
        console.log('[GET COURSE CONTENT] Auto-enrolling user in free course:', { userId, courseId });
        await db.insert(enrollments).values({
          userId,
          courseId,
          progress: 0,
          completedLessons: 0,
          accessGrantedAt: new Date(),
        });
        // Re-fetch the enrollment record
        [enrollment] = await db
          .select()
          .from(enrollments)
          .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
          .limit(1);
        console.log('[GET COURSE CONTENT] Auto-enrollment successful');
      } else {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course',
        });
      }
    }

    // Fetch course info
    const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Fetch all modules
    let modulesList = await db
      .select()
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(asc(modules.orderIndex));

    console.log('[GET COURSE CONTENT] Modules found:', modulesList.length);

    // Fetch lessons
    const lessonsList = await db
      .select()
      .from(lessons)
      .where(
        and(
          eq(lessons.courseId, courseId),
          or(eq(lessons.isPublished, true), eq(lessons.isFree, true))
        )
      )
      .orderBy(asc(lessons.orderIndex));

    console.log('[GET COURSE CONTENT] Lessons found:', lessonsList.length);

    // AUTO-REPAIR: Create missing modules
    if (lessonsList.length > 0) {
      const existingModuleIds = new Set(modulesList.map((m) => m.id));
      const referencedModuleIds = new Set(lessonsList.map((l) => l.moduleId));
      const missingModuleIds = Array.from(referencedModuleIds).filter(
        (id) => !existingModuleIds.has(id)
      );

      if (missingModuleIds.length > 0) {
        console.log('[AUTO-REPAIR] Creating missing modules:', missingModuleIds);

        try {
          for (const oldModuleId of missingModuleIds.sort((a, b) => a - b)) {
            try {
              console.log(`[AUTO-REPAIR] Attempting to create module for moduleId: ${oldModuleId}`);

              const [result] = await db.insert(modules).values({
                courseId: courseId,
                title: `Module ${oldModuleId}`,
                description: 'Course Content',
                orderIndex: oldModuleId - 1,
                isPublished: true,
              });

              const newModuleId = result.insertId;
              console.log(`[AUTO-REPAIR] Created module with NEW ID: ${newModuleId} (for old ID: ${oldModuleId})`);

              if (oldModuleId !== newModuleId) {
                await db
                  .update(lessons)
                  .set({ moduleId: newModuleId })
                  .where(and(eq(lessons.courseId, courseId), eq(lessons.moduleId, oldModuleId)));

                console.log(`[AUTO-REPAIR] Updated lessons from moduleId ${oldModuleId} to ${newModuleId}`);

                lessonsList.forEach((lesson) => {
                  if (lesson.moduleId === oldModuleId) {
                    lesson.moduleId = newModuleId;
                  }
                });
              }
            } catch (err: any) {
              console.error(`[AUTO-REPAIR] Failed to create module ${oldModuleId}:`, err.message);
            }
          }

          modulesList = await db
            .select()
            .from(modules)
            .where(eq(modules.courseId, courseId))
            .orderBy(asc(modules.orderIndex));

          console.log('[AUTO-REPAIR] Modules after repair:', modulesList.length);
        } catch (repairError: any) {
          console.error('[AUTO-REPAIR] Critical repair error:', repairError.message);
        }
      }
    }

    // Fetch user progress
    const progressList = await db
      .select()
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.courseId, courseId)));

    console.log('[GET COURSE CONTENT] Progress records:', progressList.length);

    const progressMap = new Map(progressList.map((p) => [p.lessonId, p]));

    // Group lessons by module
    const content = modulesList
      .map((module) => {
        const moduleLessons = lessonsList
          .filter((lesson) => lesson.moduleId === module.id)
          .map((lesson) => {
            const progress = progressMap.get(lesson.id);
            return {
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              contentType: lesson.contentType,
              videoUrl: lesson.videoUrl,
              pdfUrl: lesson.pdfUrl,
              textContent: lesson.textContent,
              duration: lesson.duration,
              orderIndex: lesson.orderIndex,
              moduleId: lesson.moduleId,
              isFree: lesson.isFree,
              isCompleted: progress?.isCompleted || false,
              progressPercentage: progress?.progressPercentage || 0,
              lastPosition: progress?.lastPosition || null,
            };
          });

        return {
          id: module.id,
          title: module.title,
          description: module.description,
          orderIndex: module.orderIndex,
          lessons: moduleLessons,
        };
      })
      .filter((module) => module.lessons.length > 0);

    console.log('[GET COURSE CONTENT] Final modules with lessons:', content.length);

    return res.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
      },
      enrollment: {
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons,
        lastAccessedAt: enrollment.lastAccessedAt,
      },
      modules: content,
    });
  } catch (error: any) {
    console.error('[GET COURSE CONTENT ERROR]', {
      ...(process.env.NODE_ENV === 'development' && { ...(process.env.NODE_ENV === 'development' && { error: error.message }) }),
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch course content',
    });
  }
};

/**
 * POST /api/lessons/:lessonId/progress
 * Update lesson progress
 */
export const updateLessonProgress = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId as number | undefined;
    const lessonId = Number(req.params.lessonId);
    const { progressPercentage, lastPosition, isCompleted } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (Number.isNaN(lessonId)) {
      return res.status(400).json({ success: false, message: 'Invalid lesson ID' });
    }

    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, lesson.courseId)))
      .limit(1);

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course',
      });
    }

    const [existingProgress] = await db
      .select()
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)))
      .limit(1);

    const updateData: any = {};
    if (typeof progressPercentage === 'number') updateData.progressPercentage = progressPercentage;
    if (typeof lastPosition === 'number') updateData.lastPosition = lastPosition;
    if (typeof isCompleted === 'boolean') {
      updateData.isCompleted = isCompleted;
      if (isCompleted) updateData.completedAt = new Date();
    }

    if (existingProgress) {
      await db
        .update(lessonProgress)
        .set(updateData)
        .where(eq(lessonProgress.id, existingProgress.id));
    } else {
      await db.insert(lessonProgress).values({
        userId,
        lessonId,
        courseId: lesson.courseId,
        ...updateData,
      });
    }

    const allLessons = await db.select().from(lessons).where(eq(lessons.courseId, lesson.courseId));

    const allProgress = await db
      .select()
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.courseId, lesson.courseId)));

    const completedCount = allProgress.filter((p) => p.isCompleted).length;
    const overallProgress =
      allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

    await db
      .update(enrollments)
      .set({
        progress: overallProgress,
        completedLessons: completedCount,
        lastAccessedAt: new Date(),
        ...(overallProgress === 100 && !enrollment.completedAt ? { completedAt: new Date() } : {}),
      })
      .where(eq(enrollments.id, enrollment.id));

    // ✅ AUTO-GENERATE CERTIFICATE if course just completed (100%) and is certificate-eligible
    if (overallProgress === 100 && !enrollment.completedAt) {
      const [course] = await db.select().from(courses).where(eq(courses.id, lesson.courseId)).limit(1);
      if (course && course.certificateEligible) {
        const [courseUser] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1);
        if (courseUser) {
          generateCertificateForUser({
            userId,
            type: 'course',
            courseId: lesson.courseId,
            userName: courseUser.name,
            itemName: course.title,
          }).catch((err: any) => console.error('[COURSE CERTIFICATE GENERATION ERROR]', err));
        }
      }
    }

    return res.json({
      success: true,
      message: 'Progress updated successfully',
      progress: {
        completedLessons: completedCount,
        totalLessons: allLessons.length,
        overallProgress,
      },
    });
  } catch (error: any) {
    console.error('[UPDATE LESSON PROGRESS ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update progress',
    });
  }
};

// ============================================
// ADMIN LESSON MANAGEMENT
// ============================================

export const getCourseLessonsAdmin = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId as number | undefined;
    const user = (req as any).user;
    const courseId = Number(req.params.courseId);

    if (!userId || !['admin', 'instructor'].includes(user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and instructors can access this endpoint',
      });
    }

    if (Number.isNaN(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID' });
    }

    const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const modulesList = await db
      .select()
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(asc(modules.orderIndex));

    const lessonsList = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, courseId))
      .orderBy(asc(lessons.orderIndex));

    const content = modulesList.map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      orderIndex: module.orderIndex,
      isPublished: module.isPublished,
      lessons: lessonsList
        .filter((lesson) => lesson.moduleId === module.id)
        .map((lesson) => ({
          id: lesson.id,
          moduleId: lesson.moduleId,
          courseId: lesson.courseId,
          title: lesson.title,
          description: lesson.description,
          contentType: lesson.contentType,
          videoUrl: lesson.videoUrl,
          pdfUrl: lesson.pdfUrl,
          textContent: lesson.textContent,
          duration: lesson.duration,
          orderIndex: lesson.orderIndex,
          isFree: lesson.isFree,
          isPublished: lesson.isPublished,
          createdAt: lesson.createdAt,
          updatedAt: lesson.updatedAt,
        })),
    }));

    return res.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
      },
      modules: content,
      data: lessonsList,
    });
  } catch (error: any) {
    console.error('[GET COURSE LESSONS ADMIN ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch course lessons',
    });
  }
};

export const createLesson = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId as number | undefined;
    const user = (req as any).user;

    if (!userId || !['admin', 'instructor'].includes(user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and instructors can create lessons',
      });
    }

    const {
      courseId,
      title,
      description,
      contentType,
      videoUrl,
      pdfUrl,
      textContent,
      duration,
      moduleId,
      isFree,
      isPublished,
    } = req.body;

    if (!courseId || !title || !contentType || !moduleId) {
      return res.status(400).json({
        success: false,
        message: 'courseId, title, contentType, and moduleId are required',
      });
    }

    if (contentType === 'video' && !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'videoUrl is required for video lessons',
      });
    }

    if (contentType === 'pdf' && !pdfUrl) {
      return res.status(400).json({
        success: false,
        message: 'pdfUrl is required for PDF lessons',
      });
    }

    if (contentType === 'text' && !textContent) {
      return res.status(400).json({
        success: false,
        message: 'textContent is required for text lessons',
      });
    }

    const existingLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.moduleId, Number(moduleId)));

    const maxOrderIndex =
      existingLessons.length > 0 ? Math.max(...existingLessons.map((l) => l.orderIndex)) : -1;

    const [result] = await db.insert(lessons).values({
      courseId: Number(courseId),
      moduleId: Number(moduleId),
      title,
      description: description || null,
      contentType,
      videoUrl: contentType === 'video' ? videoUrl : null,
      pdfUrl: contentType === 'pdf' ? pdfUrl : null,
      textContent: contentType === 'text' ? textContent : null,
      duration: duration ? Number(duration) : null,
      orderIndex: maxOrderIndex + 1,
      isFree: !!isFree,
      isPublished: isPublished !== undefined ? !!isPublished : true,
    });

    const allCourseLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, Number(courseId)));

    await db
      .update(courses)
      .set({ totalLessons: allCourseLessons.length })
      .where(eq(courses.id, Number(courseId)));

    const [createdLesson] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, result.insertId))
      .limit(1);

    return res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: createdLesson,
    });
  } catch (error: any) {
    console.error('[CREATE LESSON ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create lesson',
    });
  }
};

export const updateLesson = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId as number | undefined;
    const user = (req as any).user;

    if (!userId || !['admin', 'instructor'].includes(user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and instructors can update lessons',
      });
    }

    const lessonId = Number(req.params.id);

    if (Number.isNaN(lessonId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lesson ID',
      });
    }

    const [existingLesson] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (!existingLesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    const { title, description, contentType, videoUrl, pdfUrl, textContent, duration, isFree, isPublished } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (contentType !== undefined) updateData.contentType = contentType;
    if (duration !== undefined) updateData.duration = duration ? Number(duration) : null;
    if (isFree !== undefined) updateData.isFree = !!isFree;
    if (isPublished !== undefined) updateData.isPublished = !!isPublished;

    if (contentType === 'video') {
      updateData.videoUrl = videoUrl || null;
      updateData.pdfUrl = null;
      updateData.textContent = null;
    } else if (contentType === 'pdf') {
      updateData.pdfUrl = pdfUrl || null;
      updateData.videoUrl = null;
      updateData.textContent = null;
    } else if (contentType === 'text') {
      updateData.textContent = textContent || null;
      updateData.videoUrl = null;
      updateData.pdfUrl = null;
    }

    await db.update(lessons).set(updateData).where(eq(lessons.id, lessonId));

    const [updatedLesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);

    return res.json({
      success: true,
      message: 'Lesson updated successfully',
      data: updatedLesson,
    });
  } catch (error: any) {
    console.error('[UPDATE LESSON ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update lesson',
    });
  }
};

export const deleteLesson = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId as number | undefined;
    const user = (req as any).user;

    if (!userId || !['admin', 'instructor'].includes(user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and instructors can delete lessons',
      });
    }

    const lessonId = Number(req.params.id);

    if (Number.isNaN(lessonId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lesson ID',
      });
    }

    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    if (lesson.videoUrl && lesson.videoUrl.startsWith('/uploads/')) {
      const videoPath = path.join(__dirname, '../../', lesson.videoUrl);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    if (lesson.pdfUrl && lesson.pdfUrl.startsWith('/uploads/')) {
      const pdfPath = path.join(__dirname, '../../', lesson.pdfUrl);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    await db.delete(lessons).where(eq(lessons.id, lessonId));
    await db.delete(lessonProgress).where(eq(lessonProgress.lessonId, lessonId));

    const remainingLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, lesson.courseId));

    await db
      .update(courses)
      .set({ totalLessons: remainingLessons.length })
      .where(eq(courses.id, lesson.courseId));

    return res.json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error: any) {
    console.error('[DELETE LESSON ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete lesson',
    });
  }
};

export const uploadLessonVideo = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;

    if (!userId || !['admin', 'instructor'].includes(user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and instructors can upload videos',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded',
      });
    }

    if (!req.file.mimetype.startsWith('video/')) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Only video files are allowed',
      });
    }

    const fileUrl = req.file.path.replace(/\\/g, '/').replace(/^uploads/, '/uploads');

    return res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        videoUrl: fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (error: any) {
    console.error('[UPLOAD VIDEO ERROR]', error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to upload video',
    });
  }
};

export const uploadLessonPDF = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;

    if (!userId || !['admin', 'instructor'].includes(user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and instructors can upload PDFs',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded',
      });
    }

    if (req.file.mimetype !== 'application/pdf') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are allowed',
      });
    }

    const fileUrl = req.file.path.replace(/\\/g, '/').replace(/^uploads/, '/uploads');

    return res.status(201).json({
      success: true,
      message: 'PDF uploaded successfully',
      data: {
        pdfUrl: fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
      },
    });
  } catch (error: any) {
    console.error('[UPLOAD PDF ERROR]', error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to upload PDF',
    });
  }
};
