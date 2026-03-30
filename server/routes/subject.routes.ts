// server/routes/subject.routes.ts
import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import {
    getPublicSubjects,
    getSubjectWithChapters,
    getTestsBySubject,
    getAllSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
} from '../controllers/subjectController';
import {
    getChaptersBySubject,
} from '../controllers/chapterController';
import { cacheResponse } from '../middleware/cacheMiddleware';

const router = Router();

// ============================================
// PUBLIC ROUTES (cached)
// ============================================
router.get('/', cacheResponse(300), getPublicSubjects);
router.get('/:id', cacheResponse(300), getSubjectWithChapters);
router.get('/:subjectId/chapters', cacheResponse(300), getChaptersBySubject);
router.get('/:subjectId/tests', cacheResponse(120), getTestsBySubject);

// ============================================
// ADMIN ROUTES (protected)
// ============================================
router.get('/admin/all', authenticate, isAdmin, getAllSubjects);
router.post('/admin', authenticate, isAdmin, createSubject);
router.put('/admin/:id', authenticate, isAdmin, updateSubject);
router.delete('/admin/:id', authenticate, isAdmin, deleteSubject);

export default router;
