// server/controllers/currentAffairsController.ts
import { Request, Response } from 'express';
import { invalidateCache } from '../middleware/cacheMiddleware';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../db'; // ✅ FIXED - use named import
import { currentAffairs } from '@shared/schema';

export const getCurrentAffairs = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '12',
      search = '',
      category,
      importance,
      fromDate,
      toDate,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);
    const offset = (pageNum - 1) * pageSize;

    const filters: any[] = [];

    if (search) {
      const pattern = `%${search}%`;
      filters.push(
        sql`(${currentAffairs.title} LIKE ${pattern} OR ${currentAffairs.summary} LIKE ${pattern})`,
      );
    }

    if (category) {
      filters.push(eq(currentAffairs.category, category));
    }

    if (importance) {
      filters.push(eq(currentAffairs.importance, importance));
    }

    if (fromDate) {
      filters.push(gte(currentAffairs.date, fromDate));
    }

    if (toDate) {
      filters.push(lte(currentAffairs.date, toDate));
    }

    const where = filters.length ? and(...filters) : undefined;

    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(currentAffairs)
        .where(where)
        .orderBy(desc(currentAffairs.date))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ total: sql<number>`COUNT(*)` })
        .from(currentAffairs)
        .where(where),
    ]);

    res.json({
      success: true,
      items,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
      },
    });
  } catch (err: any) {
    console.error('getCurrentAffairs error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load current affairs',
    });
  }
};

export const getCurrentAffairById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }

    const [item] = await db
      .select()
      .from(currentAffairs)
      .where(eq(currentAffairs.id, id))
      .limit(1);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    // increment views (fire and forget)
    db.update(currentAffairs)
      .set({ views: sql`${currentAffairs.views} + 1` })
      .where(eq(currentAffairs.id, id))
      .catch(() => { });

    res.json({ success: true, item });
  } catch (err: any) {
    console.error('getCurrentAffairById error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load current affair',
    });
  }
};

export const createCurrentAffair = async (req: Request, res: Response) => {
  try {
    const {
      title,
      summary,
      content,
      category,
      tags,
      thumbnail,
      source,
      sourceUrl,
      date,
      importance = 'medium',
    } = req.body;

    if (!title || !content || !category || !date) {
      return res.status(400).json({
        success: false,
        message: 'title, content, category and date are required',
      });
    }

    const [inserted] = await db
      .insert(currentAffairs)
      .values({
        title,
        summary: summary || null,
        content,
        category,
        tags: tags ?? null,
        thumbnail: thumbnail || null,
        source: source || null,
        sourceUrl: sourceUrl || null,
        date,
        importance,
      })
      .$returningId();

    await invalidateCache('api_cache:GET:/api/current-affairs*');
    res.status(201).json({
      success: true,
      message: 'Current affair created successfully',
      item: inserted,
    });
  } catch (err: any) {
    console.error('createCurrentAffair error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create current affair',
    });
  }
};

export const updateCurrentAffair = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }

    const {
      title,
      summary,
      content,
      category,
      tags,
      thumbnail,
      source,
      sourceUrl,
      date,
      importance,
    } = req.body;

    const [existing] = await db
      .select({ id: currentAffairs.id })
      .from(currentAffairs)
      .where(eq(currentAffairs.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    await db
      .update(currentAffairs)
      .set({
        ...(title !== undefined && { title }),
        ...(summary !== undefined && { summary }),
        ...(content !== undefined && { content }),
        ...(category !== undefined && { category }),
        ...(tags !== undefined && { tags }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(source !== undefined && { source }),
        ...(sourceUrl !== undefined && { sourceUrl }),
        ...(date !== undefined && { date }),
        ...(importance !== undefined && { importance }),
      })
      .where(eq(currentAffairs.id, id));

    await invalidateCache('api_cache:GET:/api/current-affairs*');
    res.json({
      success: true,
      message: 'Current affair updated successfully',
    });
  } catch (err: any) {
    console.error('updateCurrentAffair error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update current affair',
    });
  }
};

export const deleteCurrentAffair = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }

    const [existing] = await db
      .select({ id: currentAffairs.id })
      .from(currentAffairs)
      .where(eq(currentAffairs.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    await db.delete(currentAffairs).where(eq(currentAffairs.id, id));

    await invalidateCache('api_cache:GET:/api/current-affairs*');
    res.json({
      success: true,
      message: 'Current affair deleted successfully',
    });
  } catch (err: any) {
    console.error('deleteCurrentAffair error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete current affair',
    });
  }
};
