// server/routes/job.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as JobCtrl from '../controllers/jobController';
import { cacheResponse } from '../middleware/cacheMiddleware';

const router = Router();

// ============================================
// PUBLIC ROUTES (cached)
// ============================================
router.get('/jobs', cacheResponse(180), JobCtrl.getAllJobs);
router.get('/jobs/states', cacheResponse(300), JobCtrl.getStates);
router.get('/jobs/organizations', cacheResponse(300), JobCtrl.getOrganizations);
router.get('/jobs/:id', cacheResponse(180), JobCtrl.getJobById);

// ============================================
// ADMIN ROUTES (Protected)
// ============================================
router.post('/jobs', authenticate, JobCtrl.createJob);
router.put('/jobs/:id', authenticate, JobCtrl.updateJob);
router.delete('/jobs/:id', authenticate, JobCtrl.deleteJob);

export default router;
