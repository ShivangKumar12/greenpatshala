// server/controllers/chapterController.ts
import { Request, Response } from 'express';
import { invalidateCache } from '../middleware/cacheMiddleware';
import { db } from '../config/db';
import { testChapters, testSubjects, quizzes } from '../../shared/schema';
import { eq, and, asc, desc, sql } from 'drizzle-orm';

// ============================================
// PUBLIC: GET CHAPTERS BY SUBJECT
// ============================================
export const getChaptersBySubject = async (req: Request, res: Response): Promise<Response> => {
    try {
        const subjectId = Number(req.params.subjectId);
        if (Number.isNaN(subjectId)) {
            return res.status(400).json({ success: false, message: 'Invalid subject ID' });
        }

        const chapters = await db
            .select()
            .from(testChapters)
            .where(and(eq(testChapters.subjectId, subjectId), eq(testChapters.isActive, true)))
            .orderBy(asc(testChapters.orderIndex), asc(testChapters.name));

        // Get test count per chapter
        const chaptersWithCounts = await Promise.all(
            chapters.map(async (chapter) => {
                const [testCountResult] = await db
                    .select({ count: sql<number>`COUNT(*)` })
                    .from(quizzes)
                    .where(and(eq(quizzes.chapterId, chapter.id), eq(quizzes.is_published, 1)));

                return {
                    ...chapter,
                    testCount: Number(testCountResult?.count || 0),
                };
            })
        );

        return res.json({ success: true, chapters: chaptersWithCounts });
    } catch (error: any) {
        console.error('[GET CHAPTERS BY SUBJECT ERROR]', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch chapters.' });
    }
};

// ============================================
// ADMIN: GET ALL CHAPTERS (with subject info)
// ============================================
export const getAllChapters = async (req: Request, res: Response): Promise<Response> => {
    try {
        const subjectIdFilter = req.query.subjectId ? Number(req.query.subjectId) : null;

        let conditions: any[] = [];
        if (subjectIdFilter && !Number.isNaN(subjectIdFilter)) {
            conditions.push(eq(testChapters.subjectId, subjectIdFilter));
        }

        const chapters = await db
            .select({
                id: testChapters.id,
                subjectId: testChapters.subjectId,
                name: testChapters.name,
                slug: testChapters.slug,
                description: testChapters.description,
                isActive: testChapters.isActive,
                orderIndex: testChapters.orderIndex,
                createdAt: testChapters.createdAt,
                updatedAt: testChapters.updatedAt,
                subjectName: testSubjects.name,
            })
            .from(testChapters)
            .leftJoin(testSubjects, eq(testChapters.subjectId, testSubjects.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(asc(testChapters.orderIndex), desc(testChapters.createdAt));

        // Get test count per chapter
        const chaptersWithCounts = await Promise.all(
            chapters.map(async (chapter) => {
                const [testCountResult] = await db
                    .select({ count: sql<number>`COUNT(*)` })
                    .from(quizzes)
                    .where(eq(quizzes.chapterId, chapter.id));

                return {
                    ...chapter,
                    testCount: Number(testCountResult?.count || 0),
                };
            })
        );

        return res.json({ success: true, chapters: chaptersWithCounts });
    } catch (error: any) {
        console.error('[ADMIN GET ALL CHAPTERS ERROR]', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch chapters.' });
    }
};

// ============================================
// ADMIN: CREATE CHAPTER
// ============================================
export const createChapter = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { subjectId, name, description, isActive, orderIndex } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Chapter name is required' });
        }
        if (!subjectId) {
            return res.status(400).json({ success: false, message: 'Subject ID is required' });
        }

        // Verify subject exists
        const [subject] = await db
            .select()
            .from(testSubjects)
            .where(eq(testSubjects.id, Number(subjectId)))
            .limit(1);

        if (!subject) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const [inserted] = await db
            .insert(testChapters)
            .values({
                subjectId: Number(subjectId),
                name: name.trim(),
                slug,
                description: description || null,
                isActive: isActive ?? true,
                orderIndex: orderIndex ?? 0,
            })
            .$returningId();

        await invalidateCache('api_cache:GET:/api/chapters*', 'api_cache:GET:/api/subjects*');
        return res.status(201).json({
            success: true,
            message: 'Chapter created successfully.',
            id: inserted.id,
        });
    } catch (error: any) {
        console.error('[CREATE CHAPTER ERROR]', error.message);
        return res.status(500).json({ success: false, message: 'Failed to create chapter.' });
    }
};

// ============================================
// ADMIN: UPDATE CHAPTER
// ============================================
export const updateChapter = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid chapter ID' });
        }

        const { name, description, subjectId, isActive, orderIndex } = req.body;
        const updates: any = {};

        if (typeof name === 'string' && name.trim()) {
            updates.name = name.trim();
            updates.slug = name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }
        if (typeof description === 'string') updates.description = description;
        if (typeof subjectId === 'number') updates.subjectId = subjectId;
        if (typeof isActive === 'boolean') updates.isActive = isActive;
        if (typeof orderIndex === 'number') updates.orderIndex = orderIndex;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        await db.update(testChapters).set(updates).where(eq(testChapters.id, id));

        await invalidateCache('api_cache:GET:/api/chapters*', 'api_cache:GET:/api/subjects*');
        return res.json({ success: true, message: 'Chapter updated successfully.' });
    } catch (error: any) {
        console.error('[UPDATE CHAPTER ERROR]', error.message);
        return res.status(500).json({ success: false, message: 'Failed to update chapter.' });
    }
};

// ============================================
// ADMIN: DELETE CHAPTER
// ============================================
export const deleteChapter = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid chapter ID' });
        }

        // Check if any tests are assigned to this chapter
        const [testCount] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(quizzes)
            .where(eq(quizzes.chapterId, id));

        if (Number(testCount?.count) > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete chapter. ${testCount.count} test(s) are assigned to it. Remove tests first.`,
            });
        }

        await db.delete(testChapters).where(eq(testChapters.id, id));

        await invalidateCache('api_cache:GET:/api/chapters*', 'api_cache:GET:/api/subjects*');
        return res.json({ success: true, message: 'Chapter deleted successfully.' });
    } catch (error: any) {
        console.error('[DELETE CHAPTER ERROR]', error.message);
        return res.status(500).json({ success: false, message: 'Failed to delete chapter.' });
    }
};
