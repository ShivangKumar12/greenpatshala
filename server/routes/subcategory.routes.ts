// server/routes/subcategory.routes.ts
import express from 'express';
import { authenticate } from '../middleware/auth';
import {
    getSubcategoriesByCategory,
    getAdminSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
} from '../controllers/subcategoryController';
import { cacheResponse } from '../middleware/cacheMiddleware';

const router = express.Router();

// Public: active subcategories (optionally filtered by categoryId) — cached 5min
router.get('/', cacheResponse(300), getSubcategoriesByCategory);

// Admin-only
router.get('/admin', authenticate, getAdminSubcategories);
router.post('/', authenticate, createSubcategory);
router.put('/:id', authenticate, updateSubcategory);
router.delete('/:id', authenticate, deleteSubcategory);

export default router;
