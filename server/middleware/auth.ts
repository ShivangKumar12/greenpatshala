// server/middleware/auth.ts - FIXED VERSION
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { db } from '../config/db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// ============================================
// REQUIRED AUTHENTICATION
// ============================================
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    // ✅ FIX: Use decoded.id instead of decoded.userId
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatar: users.avatar,
        phone: users.phone,
        bio: users.bio,
        is_verified: users.is_verified,
      })
      .from(users)
      .where(eq(users.id, decoded.id))  // ✅ CHANGED FROM decoded.userId
      .limit(1);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    (req as any).userId = user.id;
    (req as any).userRole = user.role;
    (req as any).user = user;
    
    next();
  } catch (error) {
    console.error('[AUTH MIDDLEWARE ERROR]', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

// ============================================
// OPTIONAL AUTHENTICATION
// ============================================
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return next();
    }

    // ✅ FIX: Use decoded.id instead of decoded.userId
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatar: users.avatar,
        phone: users.phone,
        bio: users.bio,
        is_verified: users.is_verified,
      })
      .from(users)
      .where(eq(users.id, decoded.id))  // ✅ CHANGED FROM decoded.userId
      .limit(1);

    if (user) {
      (req as any).userId = user.id;
      (req as any).userRole = user.role;
      (req as any).user = user;
    }

    next();
  } catch (error) {
    console.error('[OPTIONAL AUTH ERROR]', error);
    next();
  }
};

// ============================================
// AUTHORIZATION HELPERS
// ============================================
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).userRole;
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    
    next();
  };
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = (req as any).userRole;

  if (!userRole || (userRole !== 'admin' && userRole !== 'instructor')) {
    return res.status(403).json({
      success: false,
      message: 'Admin/Instructor access required',
    });
  }

  next();
};

export const isInstructor = (req: Request, res: Response, next: NextFunction) => {
  const userRole = (req as any).userRole;

  if (!userRole || (userRole !== 'instructor' && userRole !== 'admin')) {
    return res.status(403).json({
      success: false,
      message: 'Instructor access required',
    });
  }

  next();
};

export const isStudent = (req: Request, res: Response, next: NextFunction) => {
  const userRole = (req as any).userRole;

  if (!userRole || userRole !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Student access required',
    });
  }

  next();
};

// ============================================
// ✅ CRITICAL EXPORTS FOR STUDY MATERIALS
// ============================================
export const authenticateToken = authenticate;
export const isAdminOrInstructor = isAdmin;
