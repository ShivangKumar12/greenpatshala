// server/controllers/categoryController.ts
import { Request, Response } from 'express';
import { invalidateCache } from '../middleware/cacheMiddleware';
import { db } from '../config/db';
import { categories } from '../../shared/schema';
import { eq, desc, sql } from 'drizzle-orm';

// GET /api/categories/admin/all - ALL categories for admin (includes inactive)
export const getAdminCategories = async (req: Request, res: Response): Promise<Response> => {
  try {
    const rows = await db
      .select()
      .from(categories)
      .orderBy(categories.name);

    return res.json({
      success: true,
      categories: rows,
    });
  } catch (error: any) {
    console.error('[GET ADMIN CATEGORIES ERROR]', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

// GET /api/categories (public) - only active categories
export const getCategories = async (req: Request, res: Response): Promise<Response> => {
  try {
    const rows = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(desc(categories.createdAt));

    return res.json({
      success: true,
      count: rows.length,
      categories: rows,
    });
  } catch (error: any) {
    console.error('[GET CATEGORIES ERROR]', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch categories.',
    });
  }
};

// GET /api/categories/:id (admin)
export const getCategoryById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID' });
    }

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    return res.json({ success: true, category });
  } catch (error: any) {
    console.error('[GET CATEGORY BY ID ERROR]', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch category.',
    });
  }
};

// POST /api/categories (admin)
export const createCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, slug, description, isActive } = req.body as {
      name: string;
      slug?: string;
      description?: string;
      isActive?: boolean;
    };

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const finalSlug =
      slug?.trim() ||
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const [existingByName] = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name))
      .limit(1);

    if (existingByName) {
      return res
        .status(400)
        .json({ success: false, message: 'Category with this name already exists' });
    }

    const [existingBySlug] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, finalSlug))
      .limit(1);

    if (existingBySlug) {
      return res
        .status(400)
        .json({ success: false, message: 'Category slug already in use' });
    }

    const [inserted] = await db
      .insert(categories)
      .values({
        name,
        slug: finalSlug,
        description: description || null,
        isActive: isActive ?? true,
      })
      .$returningId();

    await invalidateCache('api_cache:GET:/api/categories*');
    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      id: inserted.id,
    });
  } catch (error: any) {
    console.error('[CREATE CATEGORY ERROR]', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to create category.',
    });
  }
};

// PUT /api/categories/:id (admin)
export const updateCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID' });
    }

    const { name, slug, description, isActive } = req.body as {
      name?: string;
      slug?: string;
      description?: string;
      isActive?: boolean;
    };

    const updates: any = {};
    if (typeof name === 'string') updates.name = name;
    if (typeof description === 'string') updates.description = description;
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (slug) {
      updates.slug = slug;
    } else if (name) {
      updates.slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    await db.update(categories).set(updates).where(eq(categories.id, id));

    await invalidateCache('api_cache:GET:/api/categories*');
    return res.json({
      success: true,
      message: 'Category updated successfully.',
    });
  } catch (error: any) {
    console.error('[UPDATE CATEGORY ERROR]', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to update category.',
    });
  }
};

// DELETE /api/categories/:id (admin, soft delete by isActive=false)
export const deleteCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID' });
    }

    await db
      .update(categories)
      .set({ isActive: false })
      .where(eq(categories.id, id));

    await invalidateCache('api_cache:GET:/api/categories*');
    return res.json({
      success: true,
      message: 'Category deactivated successfully.',
    });
  } catch (error: any) {
    console.error('[DELETE CATEGORY ERROR]', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to delete category.',
    });
  }
};
