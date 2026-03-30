// server/routes/payment.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createCourseOrder,
  createQuizOrder,
  createStudyMaterialOrder,
  verifyPayment,
} from '../controllers/paymentController';

const router = Router();

// Debug logs (optional – remove after confirming everything is function)
console.log('createCourseOrder:', typeof createCourseOrder);
console.log('createQuizOrder:', typeof createQuizOrder);
console.log('createStudyMaterialOrder:', typeof createStudyMaterialOrder);
console.log('verifyPayment:', typeof verifyPayment);
console.log('authenticate:', typeof authenticate);

// Create Razorpay order for a course (supports coupon)
router.post('/course/:courseId/create-order', authenticate, createCourseOrder);

// Create Razorpay order for a quiz (supports coupon)
router.post('/quiz/:quizId/create-order', authenticate, createQuizOrder);

// Create Razorpay order for a study material (supports coupon)
router.post(
  '/study-material/:studyMaterialId/create-order',
  authenticate,
  createStudyMaterialOrder
);

// Verify Razorpay payment and grant access
router.post('/verify', authenticate, verifyPayment);

export default router;
