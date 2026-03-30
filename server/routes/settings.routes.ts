// server/routes/settings.routes.ts - PRODUCTION READY
import { Router } from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth';
import {
  getSettings,
  updateSettings,
  getPublicSettings,
} from '../controllers/settingsController';
import { cacheResponse } from '../middleware/cacheMiddleware';

const router = Router();

// ============================================
// PUBLIC ROUTES (No Authentication)
// ============================================

// GET /api/settings/public - Get public settings (for footer, header, SEO) — cached 10min
router.get('/public', cacheResponse(600), getPublicSettings);

// ============================================
// ADMIN ROUTES (Authentication + Admin Role)
// ============================================

// GET /api/admin/settings - Get all settings (admin only)
router.get('/', authenticateToken, isAdmin, getSettings);

// PUT /api/admin/settings - Update settings (admin only)
router.put('/', authenticateToken, isAdmin, updateSettings);

export default router;
