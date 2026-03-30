// server/routes/certificate.routes.ts
import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import {
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
    getAllCertificates,
    getUserCertificates,
    getCertificateById,
    downloadCertificate,
} from '../controllers/certificateController';

const router = Router();

// ============================================
// ADMIN ROUTES — Templates
// ============================================
router.get('/admin/templates', authenticate, isAdmin, getTemplates);
router.post('/admin/templates', authenticate, isAdmin, createTemplate);
router.put('/admin/templates/:id', authenticate, isAdmin, updateTemplate);
router.delete('/admin/templates/:id', authenticate, isAdmin, deleteTemplate);
router.put('/admin/templates/:id/default', authenticate, isAdmin, setDefaultTemplate);

// ============================================
// ADMIN ROUTES — View all certificates
// ============================================
router.get('/admin/all', authenticate, isAdmin, getAllCertificates);

// ============================================
// USER ROUTES
// ============================================
router.get('/my', authenticate, getUserCertificates);
router.get('/:id', authenticate, getCertificateById);
router.get('/:id/download', authenticate, downloadCertificate);

export default router;
