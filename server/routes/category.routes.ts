// server/routes/category.routes.ts
import express from 'express';
import { authenticate } from '../middleware/auth';
import { cacheResponse } from '../middleware/cacheMiddleware';
import {
  getCategories,
  getAdminCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';

const router = express.Router();

// Public: active categories list (cached)
router.get('/', cacheResponse(300), getCategories);

// Admin-only routes
router.get('/admin/all', authenticate, getAdminCategories);
router.get('/:id', authenticate, getCategoryById);
router.post('/', authenticate, createCategory);
router.put('/:id', authenticate, updateCategory);
router.delete('/:id', authenticate, deleteCategory);

export default router;
