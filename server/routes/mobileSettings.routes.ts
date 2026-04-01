// server/routes/mobileSettings.routes.ts
import { Router } from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth';
import {
  getMobileSettings,
  updateMobileSettings,
  getPublicMobileSettings,
} from '../controllers/mobileSettingsController';
import { cacheResponse } from '../middleware/cacheMiddleware';

const router = Router();

// ============================================
// PUBLIC ROUTES (For Mobile App)
// ============================================

// GET /api/mobile-settings/public - Mobile app fetches its config — cached 5min
router.get('/public', cacheResponse(300), getPublicMobileSettings);

// ============================================
// ADMIN ROUTES (Authentication + Admin Role)
// ============================================

// GET /api/admin/mobile-settings - Get all mobile settings (admin only)
router.get('/', authenticateToken, isAdmin, getMobileSettings);

// PUT /api/admin/mobile-settings - Update mobile settings (admin only)
router.put('/', authenticateToken, isAdmin, updateMobileSettings);

export default router;
