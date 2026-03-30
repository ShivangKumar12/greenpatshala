// server/routes/feedback.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';
import {
  submitFeedback,
  getPublicFeedbacks,
  getAllFeedbacks,
  updateFeedback,
  deleteFeedback,
} from '../controllers/feedbackController';
import { cacheResponse } from '../middleware/cacheMiddleware';

const router = Router();

// PUBLIC ROUTES
router.post('/', submitFeedback); // Submit feedback (no auth)
router.get('/public', cacheResponse(120), getPublicFeedbacks); // Get public feedbacks (cached 2min)

// ADMIN ROUTES
router.get('/admin', authenticate, adminAuth, getAllFeedbacks); // Get all feedbacks
router.patch('/admin/:id', authenticate, adminAuth, updateFeedback); // Update feedback
router.delete('/admin/:id', authenticate, adminAuth, deleteFeedback); // Delete feedback

export default router;
