import { Request, Response } from 'express';
// Use our own RequestWithUser type for all admin handlers
// Use local RequestWithUser type only
import { db } from '../config/db';
import { courses, lessons } from '../../shared/schema';
import { and, eq, like, desc, asc, sql } from 'drizzle-orm';
import path from 'path';
import fs from 'fs';

// Helper type for req.user
type UserWithRole = { id: number; role: string; [key: string]: any };

// Helper for controller req type
type RequestWithUser = Request & { user: UserWithRole };

/**
 * Normalize decimal fields to numbers
 */
function normalizeCourse(c: any) {
  return {
    ...c,
    originalPrice: c.originalPrice ? Number(c.originalPrice) : 0,
    discountPrice: c.discountPrice ? Number(c.discountPrice) : null,
    rating: c.rating ? Number(c.rating) : 0,
  };
}

/**
 * ✅ HELPER: Check admin or instructor access
 */
function hasAdminOrInstructorAccess(user: any): boolean {
  return user?.role === 'admin' || user?.role === 'instructor';
}

/**
 * GET /api/admin/courses
 */
export const adminGetCourses = async (req: Request, res: Response) => {
  try {
    // Parse query params with defaults
    const search = (req as any).query?.search || '';
    const category = (req as any).query?.category || '';
    const level = (req as any).query?.level || '';
    const instructorId = (req as any).query?.instructorId || '';
    const status = (req as any).query?.status || '';
    const limitNum = Number((req as any).query?.limit) || 20;
    const sortBy = ((req as any).query?.sortBy as string) || 'createdAt';
    const sortOrder = ((req as any).query?.sortOrder as string) || 'desc';
    const offset = Number((req as any).query?.offset) || 0;
    const pageNum = Number((req as any).query?.page) || 1;

    const whereConditions: any[] = [];
    if (search) {
      whereConditions.push(
        sql`CONCAT(${courses.title}, ' ', ${courses.description}) LIKE ${`%${String(search)}%`}`
      );
    }
    if (category) whereConditions.push(eq(courses.category, String(category)));
    if (level) whereConditions.push(eq(courses.level, String(level)));
    if (instructorId) {
      const idNum = Number(instructorId);
      if (!Number.isNaN(idNum)) whereConditions.push(eq(courses.instructorId, idNum));
    }
    if (status === 'published') whereConditions.push(eq(courses.isPublished, true));
    else if (status === 'draft') whereConditions.push(eq(courses.isPublished, false));

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limitNum);
    let orderByClause: any = desc(courses.createdAt);
    if (sortBy && (courses as any)[sortBy]) {
      orderByClause = sortOrder === 'asc'
        ? asc((courses as any)[sortBy])
        : desc((courses as any)[sortBy]);
    }
    const courseResults = await db
      .select()
      .from(courses)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limitNum)
      .offset(offset);
    return (res as any).json({
      success: true,
      courses: courseResults.map(normalizeCourse),
      pagination: { page: pageNum, limit: limitNum, total, totalPages },
    });
  } catch (error: any) {
    console.error('[ADMIN GET COURSES ERROR]', error);
    return (res as any).status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
};

/**
 * GET /api/admin/courses/:id
 */
export const adminGetCourseById = async (req: RequestWithUser, res: Response) => {
  try {

   const id = Number((req as any).params?.id);
    if (Number.isNaN(id)) {
    return (res as any).status(400).json({ success: false, message: 'Invalid course ID' });
    }

    const course = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    if (!course[0]) {
    return (res as any).status(404).json({ success: false, message: 'Course not found' });
    }

    return (res as any).json({ success: true, course: normalizeCourse(course[0]) });
  } catch (error: any) {
    console.error('[GET COURSE BY ID ERROR]', error);
   return (res as any).status(500).json({ success: false, message: 'Failed to fetch course' });
  }
};

/**
 * POST /api/admin/courses - Create Course with ALL Options
 */
export const adminCreateCourse = async (req: RequestWithUser, res: Response) => {
  try {
    const {
      title, description, thumbnail, category, level, duration,
      language = 'Hindi & English', 
      originalPrice, 
      discountPrice,
      isFree = false, 
      isFeatured = false, 
      isPublished = false,
      totalLessons = 0, 
      totalReviews = 0,
      syllabus = [], 
      features = [], 
      requirements = [],
    } = (req as any).body;

    // Validation
    if (!title || !description || !category || !level) {
      return (res as any).status(400).json({
        success: false,
        message: 'Title, description, category, and level are required',
      });
    }

    // Validate pricing
    const parsedOriginalPrice = Number(originalPrice) || 0;
    const parsedDiscountPrice = discountPrice ? Number(discountPrice) : null;

    if (parsedDiscountPrice && parsedDiscountPrice > parsedOriginalPrice) {
      return (res as any).status(400).json({
        success: false,
        message: 'Discount price cannot be greater than original price',
      });
    }

      await db.insert(courses).values({
        title,
        description,
        thumbnail: thumbnail || null,
        videoUrl: null,
        instructorId: (req as any).user.id,
        category,
        level,
        duration: duration || 'N/A',
        language,
        originalPrice: parsedOriginalPrice,
        discountPrice: parsedDiscountPrice,
        isFree: Boolean(isFree),
        isPublished: Boolean(isPublished),
        isFeatured: Boolean(isFeatured),
        totalLessons: Number(totalLessons),
        totalStudents: 0,
        rating: 0,
        totalReviews: Number(totalReviews),
        syllabus: Array.isArray(syllabus) ? syllabus : [],
        features: Array.isArray(features) ? features : [],
        requirements: Array.isArray(requirements) ? requirements : [],
      });

    const newCourse = await db
      .select()
      .from(courses)
      .where(eq(courses.instructorId, (req as any).user.id))
      .orderBy(desc(courses.id))
      .limit(1);

    return (res as any).status(201).json({
      success: true,
      message: 'Course created successfully',
      course: normalizeCourse(newCourse[0]),
    });
  } catch (error: any) {
    console.error('[ADMIN CREATE COURSE ERROR]', error);
    return (res as any).status(500).json({ success: false, message: 'Failed to create course' });
  }
};

/**
 * PUT /api/admin/courses/:id - Update ALL Course Fields
 */
/**
 * PUT /api/admin/courses/:id - Update ALL Course Fields + Thumbnail Upload
 */
export const adminUpdateCourse = async (req: RequestWithUser, res: Response) => {
  try {
    const id = Number((req as any).params?.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID' });
    }

    const existingCourse = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    if (!existingCourse[0]) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // ✅ FIXED: Check role access
    if (existingCourse[0].instructorId !== req.user.id && !hasAdminOrInstructorAccess(req.user)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin or instructor access required' 
      });
    }

    const body = (req as any).body;
    const updateData: any = { updatedAt: new Date() };

    // ✅ NEW: Handle uploaded thumbnail file
    if ((req as any).file) {
      // Delete old thumbnail if it exists and is an uploaded file
      if (existingCourse[0].thumbnail?.startsWith('/uploads/')) {
        const oldPath = path.join(process.cwd(), existingCourse[0].thumbnail);
        if (fs.existsSync(oldPath)) {
          try { 
            fs.unlinkSync(oldPath); 
            console.log(`✅ Deleted old thumbnail: ${oldPath}`);
          } catch (err) { 
            console.error('Delete old thumbnail error:', err); 
          }
        }
      }
      updateData.thumbnail = `/uploads/courses/thumbnails/${(req as any).file.filename}`;
      console.log(`✅ New thumbnail uploaded: ${updateData.thumbnail}`);
    }

    // ✅ Basic Info
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.thumbnail !== undefined && !(req as any).file) updateData.thumbnail = body.thumbnail || null;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.level !== undefined) updateData.level = body.level;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.language !== undefined) updateData.language = body.language;
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl || null;

    // ✅ Pricing Options
    if (body.originalPrice !== undefined) {
      updateData.originalPrice = parseFloat(String(body.originalPrice)) || 0;
    }
    if (body.discountPrice !== undefined) {
      updateData.discountPrice = body.discountPrice ? parseFloat(String(body.discountPrice)) : null;
    }

    // ✅ Validate pricing
    const finalOriginalPrice = updateData.originalPrice ?? existingCourse[0].originalPrice;
    const finalDiscountPrice = updateData.discountPrice ?? existingCourse[0].discountPrice;
    
    if (finalDiscountPrice && Number(finalDiscountPrice) > Number(finalOriginalPrice)) {
      return res.status(400).json({
        success: false,
        message: 'Discount price cannot be greater than original price',
      });
    }

    const id = Number((req as any).params?.id);
    if (body.isFree !== undefined) updateData.isFree = Boolean(body.isFree);
      return (res as any).status(400).json({ success: false, message: 'Invalid course ID' });
    if (body.isFeatured !== undefined) updateData.isFeatured = Boolean(body.isFeatured);

    // ✅ Counts
    if (body.totalLessons !== undefined) updateData.totalLessons = parseInt(String(body.totalLessons)) || 0;
      return (res as any).status(404).json({ success: false, message: 'Course not found' });
    if (body.totalStudents !== undefined) updateData.totalStudents = parseInt(String(body.totalStudents)) || 0;
    if (body.rating !== undefined) updateData.rating = parseFloat(String(body.rating)) || 0;

    // ✅ Arrays
      return (res as any).status(403).json({ 
        success: false, 
        message: 'Admin or instructor access required' 
      });
    await db.update(courses).set(updateData).where(eq(courses.id, id));
    const updatedCourse = await db.select().from(courses).where(eq(courses.id, id)).limit(1);

    return (res as any).json({
      success: true,
      message: 'Course updated successfully',
      course: normalizeCourse(updatedCourse[0]),
    });
  } catch (error: any) {
    console.error('[ADMIN UPDATE COURSE ERROR]', error);
    return (res as any).status(500).json({ success: false, message: error.message });
  }
};


/**
 * PATCH /api/admin/courses/:id/quick-update
 */
export const quickUpdateCourse = async (req: RequestWithUser, res: Response) => {
      updateData.thumbnail = `/uploads/courses/thumbnails/${(req as any).file.filename}`;
    const id = Number(req.params.id);
    try {
      const id = Number((req as any).params?.id);
      if (Number.isNaN(id)) {
        return (res as any).status(400).json({ success: false, message: 'Invalid course ID' });
      }

      const existingCourse = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
      if (!existingCourse[0]) {
        return (res as any).status(404).json({ success: false, message: 'Course not found' });
      }
      if (existingCourse[0].instructorId !== (req as any).user.id && !hasAdminOrInstructorAccess((req as any).user)) {
        return (res as any).status(403).json({ 
          success: false, 
          message: 'Admin or instructor access required' 
        });
      }
      const { field, value } = (req as any).body;

      if (!field) {
        return (res as any).status(400).json({ success: false, message: 'Field name is required' });
      }

      const updateData: any = { updatedAt: new Date() };

      if (field === 'originalPrice') {
        updateData.originalPrice = parseFloat(String(value)) || 0;
      } else if (field === 'discountPrice') {
        updateData.discountPrice = value ? parseFloat(String(value)) : null;
      } else if (field === 'isFree') {
        updateData.isFree = Boolean(value);
      } else if (field === 'isFeatured') {
        updateData.isFeatured = Boolean(value);
      } else if (field === 'isPublished') {
        updateData.isPublished = Boolean(value);
      } else if (field === 'thumbnail') {
        updateData.thumbnail = value || null;
      } else {
        return (res as any).status(400).json({ success: false, message: 'Invalid field name' });
      }

      await db.update(courses).set(updateData).where(eq(courses.id, id));
      const updatedCourse = await db.select().from(courses).where(eq(courses.id, id)).limit(1);

      return (res as any).json({
        success: true,
        message: `${field} updated successfully`,
        course: normalizeCourse(updatedCourse[0]),
      });
    } catch (error: any) {
      console.error('[QUICK UPDATE ERROR]', error);
      return (res as any).status(500).json({ success: false, message: error.message });
    }
/**
 * PATCH /api/admin/courses/:id/pricing
 */
export const updateCoursePricing = async (req: RequestWithUser, res: Response) => {
  try {
    const id = Number((req as any).params?.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID' });
    }

    const existingCourse = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    if (!existingCourse[0]) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // ✅ FIXED: Role check
    if (existingCourse[0].instructorId !== req.user.id && !hasAdminOrInstructorAccess(req.user)) {
      return res.status(403).json({ success: false, message: 'Admin or instructor access required' });
    }

    const { originalPrice, discountPrice, isFree } = (req as any).body;

    const parsedOriginalPrice = originalPrice !== undefined ? parseFloat(String(originalPrice)) || 0 : existingCourse[0].originalPrice;
    const parsedDiscountPrice = discountPrice !== undefined 
      ? (discountPrice ? parseFloat(String(discountPrice)) : null) 
      : existingCourse[0].discountPrice;

    // Validate pricing
    if (parsedDiscountPrice && Number(parsedDiscountPrice) > Number(parsedOriginalPrice)) {
      return (res as any).status(400).json({
        success: false,
        message: 'Discount price cannot be greater than original price',
      });
    }

    const updateData: any = {
      originalPrice: parsedOriginalPrice,
      discountPrice: parsedDiscountPrice,
      updatedAt: new Date(),
    };

    if (isFree !== undefined) {
      updateData.isFree = Boolean(isFree);
    }

    await db.update(courses).set(updateData).where(eq(courses.id, id));
    const updatedCourse = await db.select().from(courses).where(eq(courses.id, id)).limit(1);

    return (res as any).json({
      success: true,
      message: 'Pricing updated successfully',
      course: normalizeCourse(updatedCourse[0]),
    });
  } catch (error: any) {
    console.error('[UPDATE PRICING ERROR]', error);
    return (res as any).status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/admin/courses/:id
 */
export const adminDeleteCourse = async (req: RequestWithUser, res: Response) => {
  try {
    const id = Number((req as any).params?.id);
    if (Number.isNaN(id)) {
      return (res as any).status(400).json({ success: false, message: 'Invalid course ID' });
    }

    const course = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    if (!course[0]) {
      return (res as any).status(404).json({ success: false, message: 'Course not found' });
    }

    // ✅ FIXED: Role check
    if (course[0].instructorId !== req.user.id && !hasAdminOrInstructorAccess(req.user)) {
      return (res as any).status(403).json({ success: false, message: 'Admin or instructor access required' });
    }

    const courseLessons = await db.select().from(lessons).where(eq(lessons.courseId, id));
    courseLessons.forEach(lesson => {
      if (lesson.pdfUrl) {
        const pdfPath = path.join(process.cwd(), lesson.pdfUrl);
        if (fs.existsSync(pdfPath)) {
          try { fs.unlinkSync(pdfPath); } catch (err) { console.error(err); }
        }
      }
      if (lesson.videoUrl) {
        const videoPath = path.join(process.cwd(), lesson.videoUrl);
        if (fs.existsSync(videoPath)) {
          try { fs.unlinkSync(videoPath); } catch (err) { console.error(err); }
        }
      }
    });

    await db.delete(lessons).where(eq(lessons.courseId, id));
    await db.delete(courses).where(eq(courses.id, id));

    return (res as any).json({ success: true, message: 'Course deleted successfully' });
  } catch (error: any) {
    console.error('[ADMIN DELETE COURSE ERROR]', error);
    return (res as any).status(500).json({ success: false, message: 'Failed to delete course' });
  }
};

// ✅ ALL OTHER FUNCTIONS (togglePublish, toggleFeatured, etc.) - Apply same pattern
export const togglePublish = async (req: RequestWithUser, res: Response) => {
  try {
    const id = Number((req as any).params?.id);
    if (Number.isNaN(id)) {
      return (res as any).status(400).json({ success: false, message: 'Invalid course ID' });
    }

    const course = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    if (!course[0]) {
      return (res as any).status(404).json({ success: false, message: 'Course not found' });
    }

    // ✅ FIXED: Role check
    if (course[0].instructorId !== (req as any).user.id && !hasAdminOrInstructorAccess((req as any).user)) {
      return (res as any).status(403).json({ success: false, message: 'Admin or instructor access required' });
    }

    const newStatus = !course[0].isPublished;
    await db.update(courses).set({ isPublished: newStatus, updatedAt: new Date() }).where(eq(courses.id, id));
    const updatedCourse = await db.select().from(courses).where(eq(courses.id, id)).limit(1);

    return (res as any).json({
      success: true,
      message: `Course ${newStatus ? 'published' : 'unpublished'} successfully`,
      course: normalizeCourse(updatedCourse[0]),
    });
  } catch (error: any) {
    console.error('[TOGGLE PUBLISH ERROR]', error);
    return (res as any).status(500).json({ success: false, message: error.message });
  }
};

// Apply same pattern to toggleFeatured, toggleFree, uploadCourseContent, etc.
// ... (rest of the functions follow the same pattern)

export const toggleFeatured = async (req: RequestWithUser, res: Response) => {
  try {
    const id = Number((req as any).params?.id);
    if (Number.isNaN(id)) {
      return (res as any).status(400).json({ success: false, message: 'Invalid course ID' });
    }

    const course = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    if (!course[0]) {
      return (res as any).status(404).json({ success: false, message: 'Course not found' });
    }

    if (course[0].instructorId !== (req as any).user.id && !hasAdminOrInstructorAccess((req as any).user)) {
      return (res as any).status(403).json({ success: false, message: 'Admin or instructor access required' });
    }

    const newStatus = !course[0].isFeatured;
    await db.update(courses).set({ isFeatured: newStatus, updatedAt: new Date() }).where(eq(courses.id, id));
    const updatedCourse = await db.select().from(courses).where(eq(courses.id, id)).limit(1);

    return (res as any).json({
      success: true,
      message: `Course ${newStatus ? 'marked as featured' : 'removed from featured'}`,
      course: normalizeCourse(updatedCourse[0]),
    });
  } catch (error: any) {
    console.error('[TOGGLE FEATURED ERROR]', error);
    return (res as any).status(500).json({ success: false, message: error.message });
  }
};

// ... (Include all other functions with same role check pattern)
export const toggleFree = async (req: RequestWithUser, res: Response) => {
  try {
    const id = Number((req as any).params?.id);
    if (Number.isNaN(id)) {
      return (res as any).status(400).json({ success: false, message: 'Invalid course ID' });
    }

    const course = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    if (!course[0]) {
      return (res as any).status(404).json({ success: false, message: 'Course not found' });
    }

    // ✅ FIXED: Role check
    if (course[0].instructorId !== (req as any).user.id && !hasAdminOrInstructorAccess((req as any).user)) {
      return (res as any).status(403).json({ success: false, message: 'Admin or instructor access required' });
    }

    const newStatus = !course[0].isFree;
    await db.update(courses).set({ isFree: newStatus, updatedAt: new Date() }).where(eq(courses.id, id));
    const updatedCourse = await db.select().from(courses).where(eq(courses.id, id)).limit(1);

    return (res as any).json({
      success: true,
      message: `Course marked as ${newStatus ? 'free' : 'paid'}`,
      course: normalizeCourse(updatedCourse[0]),
    });
  } catch (error: any) {
    console.error('[TOGGLE FREE ERROR]', error);
    return (res as any).status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/admin/courses/:id/content/upload
 */
export const uploadCourseContent = async (req: RequestWithUser, res: Response) => {
  try {
    const courseId = Number((req as any).params?.id);
    if (Number.isNaN(courseId)) {
      return (res as any).status(400).json({ success: false, message: 'Invalid course ID' });
    }

    const existingCourse = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
    if (!existingCourse[0]) {
      return (res as any).status(404).json({ success: false, message: 'Course not found' });
    }

    // ✅ FIXED: Role check
    if (existingCourse[0].instructorId !== (req as any).user.id && !hasAdminOrInstructorAccess((req as any).user)) {
      return (res as any).status(403).json({ success: false, message: 'Admin or instructor access required' });
    }

    const files = (req as any).files as { [fieldname: string]: Express.Multer.File[] };
    let lessonOrder = 1;

    const maxOrderResult = await db
      .select({ maxOrder: sql<number>`COALESCE(MAX(${lessons.orderIndex}), 0)` })
      .from(lessons)
      .where(eq(lessons.courseId, courseId));
    
    lessonOrder = Number(maxOrderResult[0]?.maxOrder || 0) + 1;

    if (files.pdfs?.length) {
      for (const file of files.pdfs) {
        const filePath = `/uploads/courses/pdfs/${file.filename}`;
        const fileName = file.originalname.replace(/\.[^/.]+$/, '');
        
        await db.insert(lessons).values({
          courseId,
          moduleId: 1,
          title: fileName,
          description: `PDF: ${file.originalname}`,
          contentType: 'pdf',
          pdfUrl: filePath,
          videoUrl: null,
          textContent: null,
          duration: 0,
          orderIndex: lessonOrder++,
          isFree: false,
          isPublished: true,
        });
      }
    }

    if (files.videos?.length) {
      for (const file of files.videos) {
        const filePath = `/uploads/courses/videos/${file.filename}`;
        const fileName = file.originalname.replace(/\.[^/.]+$/, '');
        
        await db.insert(lessons).values({
          courseId,
          moduleId: 1,
          title: fileName,
          description: `Video: ${file.originalname}`,
          contentType: 'video',
          videoUrl: filePath,
          pdfUrl: null,
          textContent: null,
          duration: 0,
          orderIndex: lessonOrder++,
          isFree: false,
          isPublished: true,
        });
      }
    }

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(lessons)
      .where(eq(lessons.courseId, courseId));

    await db.update(courses)
      .set({
        totalLessons: Number(totalCount[0]?.count || 0),
        updatedAt: new Date(),
      })
      .where(eq(courses.id, courseId));

    const createdLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, courseId))
      .orderBy(desc(lessons.id))
      .limit((files.pdfs?.length || 0) + (files.videos?.length || 0));

    return (res as any).json({
      success: true,
      message: `Uploaded ${(files.pdfs?.length || 0) + (files.videos?.length || 0)} files successfully`,
      data: createdLessons.reverse(),
    });
  } catch (error: any) {
    console.error('[UPLOAD COURSE CONTENT ERROR]', error);
    return (res as any).status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/courses/:id/lessons
 */
export const getCourseLessons = async (req: RequestWithUser, res: Response) => {
  try {
    const courseId = Number((req as any).params?.id);
    if (Number.isNaN(courseId)) {
      return (res as any).status(400).json({ success: false, message: 'Invalid course ID' });
    }

    const courseLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, courseId))
      .orderBy(asc(lessons.orderIndex));

    return (res as any).json({ success: true, data: courseLessons });
  } catch (error: any) {
    console.error('[GET COURSE LESSONS ERROR]', error);
    return (res as any).status(500).json({ success: false, message: 'Failed to fetch lessons' });
  }
};

/**
 * DELETE /api/admin/courses/:id/lessons/:lessonId
 */
export const deleteLesson = async (req: RequestWithUser, res: Response) => {
  try {
    const courseId = Number((req as any).params?.id);
    const lessonId = Number((req as any).params?.lessonId);

    if (Number.isNaN(courseId) || Number.isNaN(lessonId)) {
      return (res as any).status(400).json({ success: false, message: 'Invalid IDs' });
    }

    const lessonResult = await db
      .select()
      .from(lessons)
      .where(and(eq(lessons.id, lessonId), eq(lessons.courseId, courseId)))
      .limit(1);

    const lesson = lessonResult[0];
    if (!lesson) {
      return (res as any).status(404).json({ success: false, message: 'Lesson not found' });
    }

    // ✅ FIXED: Role check for course ownership
    const course = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
    if (course[0] && course[0].instructorId !== (req as any).user.id && !hasAdminOrInstructorAccess((req as any).user)) {
      return (res as any).status(403).json({ success: false, message: 'Admin or instructor access required' });
    }

    if (lesson.pdfUrl) {
      const pdfPath = path.join(process.cwd(), lesson.pdfUrl);
      if (fs.existsSync(pdfPath)) {
        try { fs.unlinkSync(pdfPath); } catch (err) { console.error(err); }
      }
    }
    if (lesson.videoUrl) {
      const videoPath = path.join(process.cwd(), lesson.videoUrl);
      if (fs.existsSync(videoPath)) {
        try { fs.unlinkSync(videoPath); } catch (err) { console.error(err); }
      }
    }

    await db.delete(lessons).where(eq(lessons.id, lessonId));

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(lessons)
      .where(eq(lessons.courseId, courseId));

    await db.update(courses)
      .set({
        totalLessons: Number(totalCount[0]?.count || 0),
        updatedAt: new Date(),
      })
      .where(eq(courses.id, courseId));

    return (res as any).json({ success: true, message: 'Lesson deleted successfully' });
  } catch (error: any) {
    console.error('[DELETE LESSON ERROR]', error);
    return (res as any).status(500).json({ success: false, message: 'Failed to delete lesson' });
  }
};

/**
 * GET /api/admin/courses/:id/statistics
 */
export const getCourseStatistics = async (req: RequestWithUser, res: Response) => {
  try {
    const courseId = Number((req as any).params?.id);
    if (Number.isNaN(courseId)) {
      return (res as any).status(400).json({ success: false, message: 'Invalid course ID' });
    }

    const course = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
    if (!course[0]) {
      return (res as any).status(404).json({ success: false, message: 'Course not found' });
    }

    // ✅ FIXED: Role check
    if (course[0].instructorId !== (req as any).user.id && !hasAdminOrInstructorAccess((req as any).user)) {
      return (res as any).status(403).json({ success: false, message: 'Admin or instructor access required' });
    }

    const lessonStats = await db
      .select({
        totalPdfs: sql<number>`SUM(CASE WHEN ${lessons.contentType} = 'pdf' THEN 1 ELSE 0 END)`,
        totalVideos: sql<number>`SUM(CASE WHEN ${lessons.contentType} = 'video' THEN 1 ELSE 0 END)`,
      })
      .from(lessons)
      .where(eq(lessons.courseId, courseId));

    return (res as any).json({
      success: true,
      statistics: {
        totalStudents: course[0].totalStudents,
        totalLessons: course[0].totalLessons,
        rating: Number(course[0].rating),
        totalReviews: course[0].totalReviews,
        totalPdfs: Number(lessonStats[0]?.totalPdfs || 0),
        totalVideos: Number(lessonStats[0]?.totalVideos || 0),
        isPublished: course[0].isPublished,
        isFeatured: course[0].isFeatured,
        isFree: course[0].isFree,
        revenue: course[0].isFree ? 0 : course[0].totalStudents * Number(course[0].discountPrice || course[0].originalPrice),
      },
    });
  } catch (error: any) {
    console.error('[GET COURSE STATISTICS ERROR]', error);
    return (res as any).status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
};
