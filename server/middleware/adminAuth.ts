// server/middleware/adminAuth.ts
import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Middleware to verify user is authenticated AND has admin/instructor role
 * Attaches user data to req.user for use in controllers
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated (from existing authenticate middleware)
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Fetch user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user has required role
    const allowedRoles = ['admin', 'instructor'];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin or instructor access required',
      });
    }

    // Attach full user data to request
    (req as any).user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error: any) {
    console.error('[ADMIN AUTH ERROR]', {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
    });
  }
};

/**
 * Middleware for instructor-only access (can only manage their own courses)
 */
export const requireInstructor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.role !== 'instructor') {
      return res.status(403).json({
        success: false,
        message: 'Instructor access required',
      });
    }

    (req as any).user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error: any) {
    console.error('[INSTRUCTOR AUTH ERROR]', {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
    });
  }
};

// ✅ ADD THIS EXPORT ALIAS
export const adminAuth = requireAdmin;
