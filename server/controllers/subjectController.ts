// server/controllers/subjectController.ts
import { Request, Response } from 'express';
import { invalidateCache } from '../middleware/cacheMiddleware';
import { db } from '../config/db';
import { testSubjects, testChapters, quizzes } from '../../shared/schema';
import { eq, desc, asc, and, sql } from 'drizzle-orm';

// ============================================
// PUBLIC: GET ALL ACTIVE SUBJECTS
// ============================================
export const getPublicSubjects = async (req: Request, res: Response): Promise<Response> => {
    try {
        const subjects = await db
            .select()
            .from(testSubjects)
            .where(eq(testSubjects.isActive, true))
            .orderBy(asc(testSubjects.orderIndex), asc(testSubjects.name));

        // Get chapter count and test count for each subject
        const subjectsWithCounts = await Promise.all(
            subjects.map(async (subject) => {
                const [chapterCountResult] = await db
                    .select({ count: sql<number>`COUNT(*)` })
                    .from(testChapters)
                    .where(and(eq(testChapters.subjectId, subject.id), eq(testChapters.isActive, true)));

                const [testCountResult] = await db
                    .select({ count: sql<number>`COUNT(*)` })
                    .from(quizzes)
                    .where(and(eq(quizzes.subjectId, subject.id), eq(quizzes.is_published, 1)));

                return {
                    ...subject,
                    chapterCount: Number(chapterCountResult?.count || 0),
                    testCount: Number(testCountResult?.count || 0),
                };
            })
        );

        return res.json({
            success: true,
            subjects: subjectsWithCounts,
        });
    } catch (error: any) {
        console.error('[GET PUBLIC SUBJECTS ERROR]', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch subjects.' });
    }
};

// ============================================
// PUBLIC: GET SUBJECT WITH CHAPTERS
// ============================================
export const getSubjectWithChapters = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid subject ID' });
        }

        const [subject] = await db
            .select()
            .from(testSubjects)
            .where(and(eq(testSubjects.id, id), eq(testSubjects.isActive, true)))
            .limit(1);

        if (!subject) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        const chapters = await db
            .select()
            .from(testChapters)
            .where(and(eq(testChapters.subjectId, id), eq(testChapters.isActive, true)))
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

        return res.json({
            success: true,
            subject,
            chapters: chaptersWithCounts,
        });
    } catch (error: any) {
        console.error('[GET SUBJECT WITH CHAPTERS ERROR]', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch subject details.' });
    }
};

// ============================================
// PUBLIC: GET TESTS BY SUBJECT (direct or via chapter)
// ============================================
export const getTestsBySubject = async (req: Request, res: Response): Promise<Response> => {
    try {
        const subjectId = Number(req.params.subjectId);
        const chapterId = req.query.chapterId ? Number(req.query.chapterId) : null;

        if (Number.isNaN(subjectId)) {
            return res.status(400).json({ success: false, message: 'Invalid subject ID' });
        }

        let conditions: any[] = [eq(quizzes.subjectId, subjectId), eq(quizzes.is_published, 1)];

        if (chapterId && !Number.isNaN(chapterId)) {
            conditions.push(eq(quizzes.chapterId, chapterId));
        }

        const tests = await db
            .select({
                id: quizzes.id,
                title: quizzes.title,
                description: quizzes.description,
                thumbnail: quizzes.thumbnail,
                category: quizzes.category,
                difficulty: quizzes.difficulty,
                duration: quizzes.duration,
                total_marks: quizzes.total_marks,
                passing_marks: quizzes.passing_marks,
                price: quizzes.price,
                discount_price: quizzes.discount_price,
                isFree: quizzes.isFree,
                freeQuestionsCount: quizzes.freeQuestionsCount,
                certificateEligible: quizzes.certificateEligible,
                subjectId: quizzes.subjectId,
                chapterId: quizzes.chapterId,
                total_attempts: quizzes.total_attempts,
                total_students: quizzes.total_students,
                created_at: quizzes.created_at,
            })
            .from(quizzes)
            .where(and(...conditions))
            .orderBy(desc(quizzes.created_at));

        return res.json({
            success: true,
            tests,
        });
    } catch (error: any) {
        console.error('[GET TESTS BY SUBJECT ERROR]', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch tests.' });
    }
};

// ============================================
// ADMIN: GET ALL SUBJECTS (with inactive)
// ============================================
export const getAllSubjects = async (req: Request, res: Response): Promise<Response> => {
    try {
        const subjects = await db
            .select()
            .from(testSubjects)
            .orderBy(asc(testSubjects.orderIndex), desc(testSubjects.createdAt));

        // Get counts
        const subjectsWithCounts = await Promise.all(
            subjects.map(async (subject) => {
                const [chapterCount] = await db
                    .select({ count: sql<number>`COUNT(*)` })
                    .from(testChapters)
                    .where(eq(testChapters.subjectId, subject.id));

                const [testCount] = await db
                    .select({ count: sql<number>`COUNT(*)` })
                    .from(quizzes)
                    .where(eq(quizzes.subjectId, subject.id));

                return {
                    ...subject,
                    chapterCount: Number(chapterCount?.count || 0),
                    testCount: Number(testCount?.count || 0),
                };
            })
        );

        return res.json({ success: true, subjects: subjectsWithCounts });
    } catch (error: any) {
        console.error('[ADMIN GET SUBJECTS ERROR]', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch subjects.' });
    }
};

// ============================================
// ADMIN: CREATE SUBJECT
// ============================================
export const createSubject = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { name, description, thumbnail, isActive, orderIndex } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Subject name is required' });
        }

        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Check duplicate name
        const [existing] = await db
            .select()
            .from(testSubjects)
            .where(eq(testSubjects.name, name.trim()))
            .limit(1);

        if (existing) {
            return res.status(400).json({ success: false, message: 'Subject with this name already exists' });
        }

        const [inserted] = await db
            .insert(testSubjects)
            .values({
                name: name.trim(),
                slug,
                description: description || null,
                thumbnail: thumbnail || null,
                isActive: isActive ?? true,
                orderIndex: orderIndex ?? 0,
            })
            .$returningId();

        await invalidateCache('api_cache:GET:/api/subjects*', 'api_cache:GET:/api/admin/subjects*');
        return res.status(201).json({
            success: true,
            message: 'Subject created successfully.',
            id: inserted.id,
        });
    } catch (error: any) {
        console.error('[CREATE SUBJECT ERROR]', error.message);
        return res.status(500).json({ success: false, message: 'Failed to create subject.' });
    }
};

// ============================================
// ADMIN: UPDATE SUBJECT
// ============================================
export const updateSubject = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid subject ID' });
        }

        const { name, description, thumbnail, isActive, orderIndex } = req.body;
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
        if (typeof thumbnail === 'string') updates.thumbnail = thumbnail;
        if (typeof isActive === 'boolean') updates.isActive = isActive;
        if (typeof orderIndex === 'number') updates.orderIndex = orderIndex;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        await db.update(testSubjects).set(updates).where(eq(testSubjects.id, id));

        await invalidateCache('api_cache:GET:/api/subjects*', 'api_cache:GET:/api/admin/subjects*');
        return res.json({ success: true, message: 'Subject updated successfully.' });
    } catch (error: any) {
        console.error('[UPDATE SUBJECT ERROR]', error.message);
        return res.status(500).json({ success: false, message: 'Failed to update subject.' });
    }
};

// ============================================
// ADMIN: DELETE SUBJECT
// ============================================
export const deleteSubject = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid subject ID' });
        }

        // Check if any tests are assigned to this subject
        const [testCount] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(quizzes)
            .where(eq(quizzes.subjectId, id));

        if (Number(testCount?.count) > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete subject. ${testCount.count} test(s) are assigned to it. Remove tests first.`,
            });
        }

        // Delete chapters of this subject first
        await db.delete(testChapters).where(eq(testChapters.subjectId, id));
        // Delete subject
        await db.delete(testSubjects).where(eq(testSubjects.id, id));

        await invalidateCache('api_cache:GET:/api/subjects*', 'api_cache:GET:/api/admin/subjects*', 'api_cache:GET:/api/chapters*');
        return res.json({ success: true, message: 'Subject deleted successfully.' });
    } catch (error: any) {
        console.error('[DELETE SUBJECT ERROR]', error.message);
        return res.status(500).json({ success: false, message: 'Failed to delete subject.' });
    }
};
