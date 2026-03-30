// server/routes/studyMaterials.routes.ts - FIXED ROUTE ORDER
import { Router } from 'express';
import { uploadSingle } from '../middleware/uploadMiddleware';
import { authenticateToken, isAdminOrInstructor } from '../middleware/auth';
import {
  getStudyMaterials,
  getStudyMaterialById,
  getAdminStudyMaterials,
  createStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
  togglePublish,
  incrementDownload,
  getPurchasedMaterials,
} from '../controllers/studyMaterialsController';
import { cacheResponse } from '../middleware/cacheMiddleware';

const router = Router();

// ✅ FIXED - Specific routes BEFORE parameterized routes
router.get('/purchased', authenticateToken, getPurchasedMaterials); // MUST BE FIRST

// PUBLIC ROUTES (cached)
router.get('/', cacheResponse(180), getStudyMaterials);
router.get('/:id', cacheResponse(180), getStudyMaterialById);
router.post('/:id/download', incrementDownload);

// ADMIN ROUTES
router.get('/admin/list', authenticateToken, isAdminOrInstructor, getAdminStudyMaterials);
router.post('/admin', authenticateToken, isAdminOrInstructor, uploadSingle, createStudyMaterial);
router.put('/admin/:id', authenticateToken, isAdminOrInstructor, uploadSingle, updateStudyMaterial);
router.delete('/admin/:id', authenticateToken, isAdminOrInstructor, deleteStudyMaterial);
router.patch('/admin/:id/toggle-publish', authenticateToken, isAdminOrInstructor, togglePublish);

export default router;
