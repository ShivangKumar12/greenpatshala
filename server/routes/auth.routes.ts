// server/routes/auth.routes.ts - PRODUCTION READY WITH GOOGLE OAUTH
import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import type { Request, Response } from 'express';
import {
  register,
  login,
  verifyOTP,
  resendOTP,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  enable2FA,
  disable2FA,
  updateNotificationPreferences,
  getNotificationPreferences,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';



const router = Router();


// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


// ============================================
// GOOGLE OAUTH ROUTES
// ============================================

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth
 * @access  Public
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5050'}/login?error=oauth_failed`
  }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      // ✅ DEBUG: Check FRONTEND_URL in callback
      console.log('🔍 CALLBACK - FRONTEND_URL value:', process.env.FRONTEND_URL);

      if (!user) {
        console.error('❌ No user in OAuth callback');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5050';
        return res.redirect(`${frontendUrl}/login?error=no_user`);
      }

      console.log('✅ Creating JWT for user:', user.email);

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Use fallback if FRONTEND_URL is not set
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5050';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${token}`;

      console.log('✅ Redirecting to:', redirectUrl);

      res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5050';
      res.redirect(`${frontendUrl}/login?error=callback_failed`);
    }
  }
);

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify JWT token and return user data (for OAuth callback)
 * @access  Public
 */
router.post('/verify-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const result = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatar: users.avatar,
        role: users.role,
        is_verified: users.is_verified,
      })
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);

    if (!result[0]) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('✅ Token verified for:', result[0].email);
    res.json({ success: true, user: result[0] });
  } catch (error) {
    console.error('❌ Token verification error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});


// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

// User Profile
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);
router.put('/profile', authenticate, updateProfile);

// Password Management
router.put('/change-password', authenticate, changePassword);

// Two-Factor Authentication
router.post('/enable-2fa', authenticate, enable2FA);
router.post('/disable-2fa', authenticate, disable2FA);

// Notification Preferences
router.get('/notification-preferences', authenticate, getNotificationPreferences);
router.put('/notification-preferences', authenticate, updateNotificationPreferences);

export default router;
