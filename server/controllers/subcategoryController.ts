// server/controllers/subcategoryController.ts
import { Request, Response } from 'express';
import { invalidateCache } from '../middleware/cacheMiddleware';
import { db } from '../config/db';
import { subcategories, categories } from '../../shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

// ============================================
// PUBLIC
// ============================================

// GET /api/subcategories?categoryId=X
export const getSubcategoriesByCategory = async (req: Request, res: Response) => {
    try {
        const categoryId = Number(req.query.categoryId);

        let query = db
            .select()
            .from(subcategories)
            .where(eq(subcategories.isActive, true))
            .orderBy(subcategories.orderIndex);

        if (categoryId && !isNaN(categoryId)) {
            query = db
                .select()
                .from(subcategories)
                .where(and(eq(subcategories.isActive, true), eq(subcategories.categoryId, categoryId)))
                .orderBy(subcategories.orderIndex) as any;
        }

        const rows = await query;
        res.json({ success: true, subcategories: rows });
    } catch (error: any) {
        console.error('[GET SUBCATEGORIES ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch subcategories' });
    }
};

// ============================================
// ADMIN
// ============================================

// GET /api/admin/subcategories
export const getAdminSubcategories = async (req: Request, res: Response) => {
    try {
        const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;

        let whereClause = undefined;
        if (categoryId && !isNaN(categoryId)) {
            whereClause = eq(subcategories.categoryId, categoryId);
        }

        const rows = await db
            .select({
                id: subcategories.id,
                categoryId: subcategories.categoryId,
                name: subcategories.name,
                slug: subcategories.slug,
                description: subcategories.description,
                isActive: subcategories.isActive,
                orderIndex: subcategories.orderIndex,
                createdAt: subcategories.createdAt,
                updatedAt: subcategories.updatedAt,
                categoryName: categories.name,
            })
            .from(subcategories)
            .leftJoin(categories, eq(subcategories.categoryId, categories.id))
            .where(whereClause)
            .orderBy(subcategories.orderIndex);

        res.json({ success: true, subcategories: rows });
    } catch (error: any) {
        console.error('[GET ADMIN SUBCATEGORIES ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch subcategories' });
    }
};

// POST /api/admin/subcategories
export const createSubcategory = async (req: Request, res: Response) => {
    try {
        const { categoryId, name, description, isActive, orderIndex } = req.body;

        if (!name || !categoryId) {
            return res.status(400).json({ success: false, message: 'Name and categoryId are required' });
        }

        // Verify category exists
        const [cat] = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);
        if (!cat) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        const [inserted] = await db
            .insert(subcategories)
            .values({
                categoryId,
                name,
                slug,
                description: description || null,
                isActive: isActive ?? true,
                orderIndex: orderIndex ?? 0,
            })
            .$returningId();

        await invalidateCache('api_cache:GET:/api/subcategories*');
        res.status(201).json({
            success: true,
            message: 'Subcategory created successfully',
            id: inserted.id,
        });
    } catch (error: any) {
        console.error('[CREATE SUBCATEGORY ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Failed to create subcategory' });
    }
};

// PUT /api/admin/subcategories/:id
export const updateSubcategory = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

        const { name, description, categoryId, isActive, orderIndex } = req.body;
        const updates: any = {};

        if (typeof name === 'string') {
            updates.name = name;
            updates.slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        }
        if (typeof description === 'string') updates.description = description;
        if (typeof categoryId === 'number') updates.categoryId = categoryId;
        if (typeof isActive === 'boolean') updates.isActive = isActive;
        if (typeof orderIndex === 'number') updates.orderIndex = orderIndex;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        await db.update(subcategories).set(updates).where(eq(subcategories.id, id));
        await invalidateCache('api_cache:GET:/api/subcategories*');
        res.json({ success: true, message: 'Subcategory updated successfully' });
    } catch (error: any) {
        console.error('[UPDATE SUBCATEGORY ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Failed to update subcategory' });
    }
};

// DELETE /api/admin/subcategories/:id
export const deleteSubcategory = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

        await db.update(subcategories).set({ isActive: false }).where(eq(subcategories.id, id));
        await invalidateCache('api_cache:GET:/api/subcategories*');
        res.json({ success: true, message: 'Subcategory deactivated successfully' });
    } catch (error: any) {
        console.error('[DELETE SUBCATEGORY ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete subcategory' });
    }
};
