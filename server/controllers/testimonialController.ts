// server/controllers/testimonialController.ts
import { Request, Response } from 'express';
import { invalidateCache } from '../middleware/cacheMiddleware';
import { db } from '../config/db';
import { testimonials } from '../../shared/schema';
import { eq, desc, asc } from 'drizzle-orm';

export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const activeTestimonials = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.isActive, true))
      .orderBy(asc(testimonials.displayOrder), desc(testimonials.createdAt))
      .limit(limit);

    return res.json({
      success: true,
      testimonials: activeTestimonials,
    });
  } catch (error: any) {
    console.error('[GET TESTIMONIALS ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
    });
  }
};

export const getAllTestimonials = async (req: Request, res: Response) => {
  try {
    const allTestimonials = await db
      .select()
      .from(testimonials)
      .orderBy(asc(testimonials.displayOrder), desc(testimonials.createdAt));

    return res.json({
      success: true,
      testimonials: allTestimonials,
    });
  } catch (error: any) {
    console.error('[GET ALL TESTIMONIALS ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
    });
  }
};

export const createTestimonial = async (req: Request, res: Response) => {
  try {
    const { name, role, avatar, content, rating, displayOrder } = req.body;

    if (!name || !role || !content) {
      return res.status(400).json({
        success: false,
        message: 'Name, role, and content are required',
      });
    }

    const [testimonial] = await db.insert(testimonials).values({
      name: name.trim(),
      role: role.trim(),
      avatar: avatar?.trim() || name.substring(0, 2).toUpperCase(),
      content: content.trim(),
      rating: rating || 5,
      displayOrder: displayOrder || 0,
      isActive: true,
    });

    await invalidateCache('api_cache:GET:/api/testimonials*');
    return res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      testimonial: { id: testimonial.insertId },
    });
  } catch (error: any) {
    console.error('[CREATE TESTIMONIAL ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create testimonial',
    });
  }
};

export const updateTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role, avatar, content, rating, isActive, displayOrder } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (role) updateData.role = role.trim();
    if (avatar) updateData.avatar = avatar.trim();
    if (content) updateData.content = content.trim();
    if (rating) updateData.rating = rating;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof displayOrder === 'number') updateData.displayOrder = displayOrder;

    await db.update(testimonials).set(updateData).where(eq(testimonials.id, Number(id)));

    await invalidateCache('api_cache:GET:/api/testimonials*');
    return res.json({
      success: true,
      message: 'Testimonial updated successfully',
    });
  } catch (error: any) {
    console.error('[UPDATE TESTIMONIAL ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update testimonial',
    });
  }
};

export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db.delete(testimonials).where(eq(testimonials.id, Number(id)));

    await invalidateCache('api_cache:GET:/api/testimonials*');
    return res.json({
      success: true,
      message: 'Testimonial deleted successfully',
    });
  } catch (error: any) {
    console.error('[DELETE TESTIMONIAL ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete testimonial',
    });
  }
};
