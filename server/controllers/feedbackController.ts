// server/controllers/feedbackController.ts
import { Request, Response } from 'express';
import { invalidateCache } from '../middleware/cacheMiddleware';
import { db } from '../config/db';
import { feedbacks } from '../../shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { name, email, message, rating } = req.body;
    const userId = (req as any).userId || null;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Feedback message is required',
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const [feedback] = await db.insert(feedbacks).values({
      name: name?.trim() || 'Anonymous',
      email: email?.trim() || null,
      message: message.trim(),
      rating: rating || 5,
      userId,
      status: 'pending',
      isPublic: false,
    });

    console.log('[SUBMIT FEEDBACK] Success:', feedback.insertId);

    await invalidateCache('api_cache:GET:/api/feedbacks*');
    return res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      feedback: {
        id: feedback.insertId,
        name: name?.trim() || 'Anonymous',
        message: message.trim(),
        rating: rating || 5,
      },
    });
  } catch (error: any) {
    console.error('[SUBMIT FEEDBACK ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
    });
  }
};

export const getPublicFeedbacks = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const publicFeedbacks = await db
      .select({
        id: feedbacks.id,
        name: feedbacks.name,
        message: feedbacks.message,
        rating: feedbacks.rating,
        createdAt: feedbacks.createdAt,
      })
      .from(feedbacks)
      .where(and(eq(feedbacks.status, 'approved'), eq(feedbacks.isPublic, true)))
      .orderBy(desc(feedbacks.createdAt))
      .limit(limit);

    return res.json({
      success: true,
      feedbacks: publicFeedbacks,
    });
  } catch (error: any) {
    console.error('[GET PUBLIC FEEDBACKS ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch feedbacks',
    });
  }
};

export const getAllFeedbacks = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    let conditions = [];
    if (status && status !== 'all') {
      conditions.push(eq(feedbacks.status, status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const allFeedbacks = await db
      .select()
      .from(feedbacks)
      .where(whereClause)
      .orderBy(desc(feedbacks.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(feedbacks)
      .where(whereClause);

    return res.json({
      success: true,
      feedbacks: allFeedbacks,
      total: Number(count),
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('[GET ALL FEEDBACKS ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch feedbacks',
    });
  }
};

export const updateFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, isPublic } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (typeof isPublic === 'boolean') updateData.isPublic = isPublic;

    await db.update(feedbacks).set(updateData).where(eq(feedbacks.id, Number(id)));

    await invalidateCache('api_cache:GET:/api/feedbacks*');
    return res.json({
      success: true,
      message: 'Feedback updated successfully',
    });
  } catch (error: any) {
    console.error('[UPDATE FEEDBACK ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update feedback',
    });
  }
};

export const deleteFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db.delete(feedbacks).where(eq(feedbacks.id, Number(id)));

    await invalidateCache('api_cache:GET:/api/feedbacks*');
    return res.json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (error: any) {
    console.error('[DELETE FEEDBACK ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete feedback',
    });
  }
};
