// server/controllers/studyMaterialsController.ts - PRODUCTION READY WITH FIXED PDF EXTRACTION
import { Request, Response } from 'express';
import { invalidateCache } from '../middleware/cacheMiddleware';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { studyMaterials, studyMaterialPurchases } from '@shared/schema';
import path from 'path';
import fs from 'fs';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}



// ============================================
// HELPER FUNCTION - Extract PDF Pages
// ============================================
async function extractPdfPageCount(filePath: string): Promise<number | null> {
  try {
    // Try to use pdf-parse
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.numpages;
  } catch (error: any) {
    // If pdf-parse fails, try alternative method
    console.warn('[extractPdfPageCount] Primary method failed, trying alternative...');

    try {
      // Alternative: Count page objects in PDF
      const dataBuffer = fs.readFileSync(filePath);
      const pdfContent = dataBuffer.toString('latin1');
      const pageMatches = pdfContent.match(/\/Type[\s]*\/Page[^s]/g);
      if (pageMatches) {
        return pageMatches.length;
      }
    } catch (altError: any) {
      console.warn('[extractPdfPageCount] Alternative method failed:', altError.message);
    }

    // If all methods fail, return null (not critical)
    console.warn('[extractPdfPageCount] Could not extract page count, continuing without it');
    return null;
  }
}

// ============================================
// PUBLIC ROUTES
// ============================================

export const getStudyMaterials = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      category,
      subject,
      fileType,
      isFree,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (pageNum - 1) * pageSize;

    const filters: any[] = [eq(studyMaterials.isPublished, true)];

    if (search) {
      const pattern = `%${search}%`;
      filters.push(
        sql`(${studyMaterials.title} LIKE ${pattern} OR ${studyMaterials.description} LIKE ${pattern})`
      );
    }

    if (category) filters.push(eq(studyMaterials.category, category));
    if (subject) filters.push(eq(studyMaterials.subject, subject));
    if (fileType) filters.push(eq(studyMaterials.fileType, fileType));
    if (isFree !== undefined) {
      const isPaidValue = isFree === 'true' ? false : true;
      filters.push(eq(studyMaterials.isPaid, isPaidValue));
    }

    const where = filters.length ? and(...filters) : undefined;

    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(studyMaterials)
        .where(where)
        .orderBy(desc(studyMaterials.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ total: sql<number>`COUNT(*)` })
        .from(studyMaterials)
        .where(where),
    ]);

    res.json({
      success: true,
      items,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (error: any) {
    console.error('[getStudyMaterials] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch study materials',
    });
  }
};

export const getStudyMaterialById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const [item] = await db
      .select()
      .from(studyMaterials)
      .where(eq(studyMaterials.id, id))
      .limit(1);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found',
      });
    }

    // Increment views asynchronously (fire and forget)
    db.update(studyMaterials)
      .set({ views: sql`${studyMaterials.views} + 1` })
      .where(eq(studyMaterials.id, id))
      .catch((err) => console.error('[getStudyMaterialById] View increment failed:', err));

    res.json({ success: true, item });
  } catch (error: any) {
    console.error('[getStudyMaterialById] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch study material',
    });
  }
};

export const incrementDownload = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    await db
      .update(studyMaterials)
      .set({ downloads: sql`${studyMaterials.downloads} + 1` })
      .where(eq(studyMaterials.id, id));

    res.json({ success: true });
  } catch (error: any) {
    console.error('[incrementDownload] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update download count',
    });
  }
};

// ============================================
// ADMIN ROUTES
// ============================================

export const getAdminStudyMaterials = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      category,
      subject,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (pageNum - 1) * pageSize;

    const filters: any[] = [];

    if (search) {
      const pattern = `%${search}%`;
      filters.push(
        sql`(${studyMaterials.title} LIKE ${pattern} OR ${studyMaterials.description} LIKE ${pattern})`
      );
    }

    if (category && category !== 'all') {
      filters.push(eq(studyMaterials.category, category));
    }

    if (subject && subject !== 'all') {
      filters.push(eq(studyMaterials.subject, subject));
    }

    if (status === 'published') {
      filters.push(eq(studyMaterials.isPublished, true));
    } else if (status === 'draft') {
      filters.push(eq(studyMaterials.isPublished, false));
    } else if (status === 'free') {
      filters.push(eq(studyMaterials.isPaid, false));
    } else if (status === 'paid') {
      filters.push(eq(studyMaterials.isPaid, true));
    }

    const where = filters.length ? and(...filters) : undefined;

    const orderColumn =
      sortBy === 'downloads' ? studyMaterials.downloads : studyMaterials.createdAt;
    const orderDirection = sortOrder === 'ASC' ? orderColumn : desc(orderColumn);

    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(studyMaterials)
        .where(where)
        .orderBy(orderDirection)
        .limit(pageSize)
        .offset(offset),
      db
        .select({ total: sql<number>`COUNT(*)` })
        .from(studyMaterials)
        .where(where),
    ]);

    res.json({
      success: true,
      materials: items,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (error: any) {
    console.error('[getAdminStudyMaterials] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin study materials',
    });
  }
};

// ✅ FIXED - Create with graceful PDF extraction
export const createStudyMaterial = async (req: MulterRequest, res: Response) => {
  try {
    const { title, description, subject, category, isFree, price, discountPrice } = req.body;

    // Validation
    if (!title?.trim() || !subject?.trim() || !category?.trim()) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error('[createStudyMaterial] File cleanup failed:', err);
        }
      }
      return res.status(400).json({
        success: false,
        message: 'Title, subject, and category are required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'PDF file is required',
      });
    }

    const fileUrl = `/uploads/study-materials/${req.file.filename}`;
    const fileSize = req.file.size;

    // ✅ FIXED - Extract PDF page count with graceful fallback
    const totalPages = await extractPdfPageCount(req.file.path);

    const isPaid = isFree === 'false' || isFree === false ? true : false;
    const finalPrice = isPaid ? parseFloat(price as string) || 0 : 0;
    const finalDiscountPrice =
      isPaid && discountPrice ? parseFloat(discountPrice as string) : null;

    const [inserted] = await db
      .insert(studyMaterials)
      .values({
        title: title.trim(),
        description: description?.trim() || null,
        subject: subject.trim(),
        category: category.trim(),
        fileType: 'pdf',
        fileUrl,
        fileSize,
        totalPages,
        isPaid,
        price: finalPrice,
        discountPrice: finalDiscountPrice,
        isPublished: true,
        downloads: 0,
        views: 0,
      })
      .returning();

    await invalidateCache('api_cache:GET:/api/study-materials*', 'api_cache:GET:/api/admin/study-materials*');
    res.status(201).json({
      success: true,
      message: 'Study material created successfully',
      materialId: inserted.id,
    });
  } catch (error: any) {
    console.error('[createStudyMaterial] Error:', error);

    // Cleanup uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('[createStudyMaterial] File cleanup failed:', unlinkErr);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create study material',
      error: error.message,
    });
  }
};

// ✅ FIXED - Update with optional PDF and graceful extraction
export const updateStudyMaterial = async (req: MulterRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const { title, description, subject, category, isFree, price, discountPrice } = req.body;

    const [existing] = await db
      .select()
      .from(studyMaterials)
      .where(eq(studyMaterials.id, id))
      .limit(1);

    if (!existing) {
      // Cleanup uploaded file if material not found
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error('[updateStudyMaterial] File cleanup failed:', err);
        }
      }
      return res.status(404).json({
        success: false,
        message: 'Study material not found',
      });
    }

    const isPaid = isFree === 'false' || isFree === false ? true : false;
    const finalPrice = isPaid ? parseFloat(price as string) || 0 : 0;
    const finalDiscountPrice =
      isPaid && discountPrice ? parseFloat(discountPrice as string) : null;

    let fileUrl = existing.fileUrl;
    let fileSize = existing.fileSize;
    let totalPages = existing.totalPages;

    // ✅ FIXED - Handle optional PDF replacement with graceful extraction
    if (req.file) {
      console.log('[updateStudyMaterial] Replacing PDF file');

      // Delete old file
      if (existing.fileUrl) {
        try {
          const oldPath = path.join(__dirname, '../../', existing.fileUrl);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
            console.log('[updateStudyMaterial] Old file deleted:', oldPath);
          }
        } catch (err) {
          console.error('[updateStudyMaterial] Old file deletion failed:', err);
        }
      }

      // Set new file details
      fileUrl = `/uploads/study-materials/${req.file.filename}`;
      fileSize = req.file.size;

      // ✅ FIXED - Extract page count with graceful fallback
      totalPages = await extractPdfPageCount(req.file.path);
    }

    await db
      .update(studyMaterials)
      .set({
        title: title?.trim() || existing.title,
        description: description?.trim() || existing.description,
        subject: subject?.trim() || existing.subject,
        category: category?.trim() || existing.category,
        isPaid,
        price: finalPrice,
        discountPrice: finalDiscountPrice,
        fileUrl,
        fileSize,
        totalPages,
      })
      .where(eq(studyMaterials.id, id));

    await invalidateCache('api_cache:GET:/api/study-materials*', 'api_cache:GET:/api/admin/study-materials*');
    res.json({
      success: true,
      message: 'Study material updated successfully',
    });
  } catch (error: any) {
    console.error('[updateStudyMaterial] Error:', error);

    // Cleanup uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('[updateStudyMaterial] File cleanup failed:', unlinkErr);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update study material',
      error: error.message,
    });
  }
};

export const deleteStudyMaterial = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const [material] = await db
      .select()
      .from(studyMaterials)
      .where(eq(studyMaterials.id, id))
      .limit(1);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found',
      });
    }

    // Delete from database first
    await db.delete(studyMaterials).where(eq(studyMaterials.id, id));

    // Delete file from filesystem
    if (material.fileUrl) {
      try {
        const filePath = path.join(__dirname, '../../', material.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('[deleteStudyMaterial] File deleted:', filePath);
        }
      } catch (fileErr: any) {
        console.error('[deleteStudyMaterial] File deletion failed:', fileErr.message);
      }
    }

    await invalidateCache('api_cache:GET:/api/study-materials*', 'api_cache:GET:/api/admin/study-materials*');
    res.json({
      success: true,
      message: 'Study material deleted successfully',
    });
  } catch (error: any) {
    console.error('[deleteStudyMaterial] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete study material',
    });
  }
};
// ============================================
// GET PURCHASED MATERIALS (Student)
// ============================================
export const getPurchasedMaterials = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const purchased = await db
      .select({
        id: studyMaterialPurchases.id,
        studyMaterialId: studyMaterialPurchases.studyMaterialId,
        purchaseDate: studyMaterialPurchases.createdAt,
        title: studyMaterials.title,
        subject: studyMaterials.subject,
        category: studyMaterials.category,
        fileType: studyMaterials.fileType,
        fileUrl: studyMaterials.fileUrl,
        fileSize: studyMaterials.fileSize,
        totalPages: studyMaterials.totalPages,
        thumbnail: studyMaterials.thumbnail,
      })
      .from(studyMaterialPurchases)
      .innerJoin(
        studyMaterials,
        eq(studyMaterialPurchases.studyMaterialId, studyMaterials.id)
      )
      .where(eq(studyMaterialPurchases.userId, userId))
      .orderBy(desc(studyMaterialPurchases.createdAt));

    res.json({
      success: true,
      materials: purchased,
    });
  } catch (error: any) {
    console.error('[getPurchasedMaterials] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your study materials',
    });
  }
};


export const togglePublish = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const [material] = await db
      .select({ isPublished: studyMaterials.isPublished })
      .from(studyMaterials)
      .where(eq(studyMaterials.id, id))
      .limit(1);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found',
      });
    }

    const newStatus = !material.isPublished;

    await db
      .update(studyMaterials)
      .set({ isPublished: newStatus })
      .where(eq(studyMaterials.id, id));

    await invalidateCache('api_cache:GET:/api/study-materials*', 'api_cache:GET:/api/admin/study-materials*');
    res.json({
      success: true,
      message: `Study material ${newStatus ? 'published' : 'unpublished'} successfully`,
      isPublished: newStatus,
    });
  } catch (error: any) {
    console.error('[togglePublish] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update publish status',
    });
  }
};
