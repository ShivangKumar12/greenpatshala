// server/routes/chapter.routes.ts
import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import {
    getAllChapters,
    createChapter,
    updateChapter,
    deleteChapter,
} from '../controllers/chapterController';

const router = Router();

// ============================================
// ADMIN ROUTES (protected)
// ============================================
router.get('/', authenticate, isAdmin, getAllChapters);
router.post('/', authenticate, isAdmin, createChapter);
router.put('/:id', authenticate, isAdmin, updateChapter);
router.delete('/:id', authenticate, isAdmin, deleteChapter);

export default router;
