// server/routes/coupon.routes.ts - PRODUCTION READY
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';
import {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
  validateCoupon,
} from '../controllers/couponController';

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================
router.post('/validate', validateCoupon);

// ============================================
// ADMIN ROUTES (Protected)
// ============================================
router.get('/admin/coupons', authenticate, adminAuth, getAllCoupons);
router.get('/admin/coupons/:id', authenticate, adminAuth, getCouponById);
router.post('/admin/coupons', authenticate, adminAuth, createCoupon);
router.put('/admin/coupons/:id', authenticate, adminAuth, updateCoupon);
router.patch('/admin/coupons/:id/toggle', authenticate, adminAuth, toggleCouponStatus);
router.delete('/admin/coupons/:id', authenticate, adminAuth, deleteCoupon);

export default router;
