// server/routes/testimonial.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';
import {
  getTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/testimonialController';
import { cacheResponse } from '../middleware/cacheMiddleware';

const router = Router();

// PUBLIC ROUTE (cached 10min)
router.get('/', cacheResponse(600), getTestimonials);

// ADMIN ROUTES
router.get('/admin', authenticate, adminAuth, getAllTestimonials); // Get all testimonials
router.post('/admin', authenticate, adminAuth, createTestimonial); // Create testimonial
router.patch('/admin/:id', authenticate, adminAuth, updateTestimonial); // Update testimonial
router.delete('/admin/:id', authenticate, adminAuth, deleteTestimonial); // Delete testimonial

export default router;
