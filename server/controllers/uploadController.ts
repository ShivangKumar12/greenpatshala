// server/controllers/uploadController.ts
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../config/db';
import { courseFiles } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

/**
 * POST /api/upload/course-content
 * Upload video/pdf/asset for course
 * Body: { courseId: number }
 */
export const uploadCourseContent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;

    if (!userId || !['admin', 'instructor'].includes(user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only instructors and admins can upload course content',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { courseId } = req.body;

    if (!courseId || isNaN(Number(courseId))) {
      // Delete uploaded file if courseId is invalid
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Valid course ID is required',
      });
    }

    // Determine file type from mimetype
    let fileType = 'asset';
    if (req.file.mimetype.startsWith('video/')) {
      fileType = 'video';
    } else if (req.file.mimetype === 'application/pdf') {
      fileType = 'pdf';
    }

    // Build file URL
    const fileUrl = req.file.path.replace(/\\/g, '/').replace(/^uploads/, '/uploads');

    // Save to database
    const [uploadedFile] = await db.insert(courseFiles).values({
      courseId: Number(courseId),
      fileName: req.file.originalname,
      fileUrl,
      fileType,
      fileSize: req.file.size,
      uploadedBy: userId,
    });

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        id: uploadedFile.insertId,
        fileUrl,
        fileType,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        courseId: Number(courseId),
      },
    });
  } catch (error: any) {
    console.error('[UPLOAD ERROR]', error);
    
    // Clean up file if database insert fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to upload file',
    });
  }
};

/**
 * GET /api/upload/course-content/list?courseId=2
 * List files for a specific course
 */
export const listCourseContent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;

    if (!userId || !['admin', 'instructor'].includes(user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only instructors and admins can view uploads',
      });
    }

    const { courseId, type } = req.query as { courseId?: string; type?: string };

    let whereClause: any = undefined;

    if (courseId && type) {
      whereClause = and(
        eq(courseFiles.courseId, Number(courseId)),
        eq(courseFiles.fileType, type)
      );
    } else if (courseId) {
      whereClause = eq(courseFiles.courseId, Number(courseId));
    } else if (type) {
      whereClause = eq(courseFiles.fileType, type);
    }

    const files = whereClause
      ? await db.select().from(courseFiles).where(whereClause)
      : await db.select().from(courseFiles);

    return res.json({
      success: true,
      count: files.length,
      files: files.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    });
  } catch (error: any) {
    console.error('[LIST FILES ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list files',
    });
  }
};

/**
 * DELETE /api/upload/course-content/:id
 * Delete uploaded file by ID
 */
export const deleteCourseContent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;

    if (!userId || !['admin', 'instructor'].includes(user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only instructors and admins can delete course content',
      });
    }

    const fileId = Number(req.params.id);

    if (isNaN(fileId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid file ID is required',
      });
    }

    // Get file info from database
    const [file] = await db
      .select()
      .from(courseFiles)
      .where(eq(courseFiles.id, fileId))
      .limit(1);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '../../', file.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await db.delete(courseFiles).where(eq(courseFiles.id, fileId));

    return res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error: any) {
    console.error('[DELETE FILE ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete file',
    });
  }
};
