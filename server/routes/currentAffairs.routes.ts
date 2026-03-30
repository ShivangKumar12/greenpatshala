// server/routes/currentAffairs.routes.ts
import { Router } from 'express';
import {
  getCurrentAffairs,
  getCurrentAffairById,
  createCurrentAffair,
  updateCurrentAffair,
  deleteCurrentAffair,
} from '../controllers/currentAffairsController';
import { cacheResponse } from '../middleware/cacheMiddleware';

const router = Router();

// Public (cached)
router.get('/', cacheResponse(180), getCurrentAffairs);
router.get('/:id', cacheResponse(180), getCurrentAffairById);

// Admin (wrap with auth middleware if needed, e.g. requireAdmin)
router.post('/', /* requireAdmin, */ createCurrentAffair);
router.put('/:id', /* requireAdmin, */ updateCurrentAffair);
router.delete('/:id', /* requireAdmin, */ deleteCurrentAffair);

export default router;
