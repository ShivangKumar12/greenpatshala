// server/controllers/userManagementController.ts - COMPLETE WITH CREATE USER
import { Request, Response } from 'express';
import { and, desc, eq, sql, or, like } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users, enrollments, quiz_attempts } from '@shared/schema';


// ============================================
// CONSTANTS
// ============================================
const BCRYPT_ROUNDS = 12;
const PASSWORD_MIN_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;


// ============================================
// GET ALL USERS WITH STATS
// ============================================
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      role,
      status,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (pageNum - 1) * pageSize;

    const filters: any[] = [];

    // Search by name or email
    if (search) {
      const pattern = `%${search}%`;
      filters.push(
        or(
          like(users.name, pattern),
          like(users.email, pattern)
        )
      );
    }

    // Filter by role
    if (role && role !== 'all') {
      filters.push(eq(users.role, role));
    }

    // Filter by status (using is_verified as active status)
    if (status && status !== 'all') {
      if (status === 'active') {
        filters.push(eq(users.is_verified, true));
      } else if (status === 'suspended') {
        filters.push(eq(users.is_verified, false));
      }
    }

    const where = filters.length ? and(...filters) : undefined;

    // Get users with pagination
    const [usersList, [{ total }]] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          avatar: users.avatar,
          phone: users.phone,
          isVerified: users.is_verified,
          createdAt: users.created_at,
          updatedAt: users.updated_at,
        })
        .from(users)
        .where(where)
        .orderBy(desc(users.created_at))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ total: sql<number>`COUNT(*)` })
        .from(users)
        .where(where),
    ]);

    // Get stats for each user
    const usersWithStats = await Promise.all(
      usersList.map(async (user) => {
        // Count enrollments
        const [enrollmentData] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(enrollments)
          .where(eq(enrollments.userId, user.id));

        // Count quiz attempts (distinct quizzes)
        const [quizData] = await db
          .select({ count: sql<number>`COUNT(DISTINCT ${quiz_attempts.quiz_id})` })
          .from(quiz_attempts)
          .where(eq(quiz_attempts.user_id, user.id));

        // Calculate total spent (from payments table if exists, otherwise 0)
        const totalSpent = 0;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isVerified, // Map isVerified to isActive
          createdAt: user.createdAt,
          lastLoginAt: user.updatedAt, // Using updatedAt as proxy
          stats: {
            coursesEnrolled: enrollmentData?.count || 0,
            quizzesAttempted: quizData?.count || 0,
            totalSpent: totalSpent,
          },
        };
      })
    );

    // Get overall stats
    const [statsData] = await db
      .select({
        totalUsers: sql<number>`COUNT(*)`,
        activeUsers: sql<number>`SUM(CASE WHEN ${users.is_verified} = 1 THEN 1 ELSE 0 END)`,
        instructors: sql<number>`SUM(CASE WHEN ${users.role} = 'instructor' THEN 1 ELSE 0 END)`,
        admins: sql<number>`SUM(CASE WHEN ${users.role} = 'admin' THEN 1 ELSE 0 END)`,
      })
      .from(users);

    res.json({
      success: true,
      users: usersWithStats,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
      stats: statsData,
    });
  } catch (error: any) {
    console.error('[getAllUsers] Error:', error.message);
    console.error('[getAllUsers] Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
};


// ============================================
// ✅ NEW - CREATE USER MANUALLY
// ============================================
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role, isVerified, isActive } = req.body;

    // ============================================
    // VALIDATION
    // ============================================

    // Required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    // Name validation
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long',
      });
    }

    // Email validation
    const trimmedEmail = email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Password validation
    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
      });
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      });
    }

    // Phone validation (optional)
    if (phone && phone.trim() && !PHONE_REGEX.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format',
      });
    }

    // Role validation
    const validRoles = ['user', 'instructor', 'admin'];
    const userRole = role?.toLowerCase() || 'user';
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Allowed roles: user, instructor, admin',
      });
    }

    // ============================================
    // CHECK DUPLICATE EMAIL
    // ============================================

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, trimmedEmail))
      .limit(1);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    // ============================================
    // HASH PASSWORD
    // ============================================

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // ============================================
    // CREATE USER
    // ============================================

    const [result] = await db.insert(users).values({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      phone: phone?.trim() || null,
      role: userRole as 'user' | 'instructor' | 'admin',
      is_verified: isVerified !== undefined ? Boolean(isVerified) : true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const insertId = (result as any).insertId;

    console.log('[createUser] User created:', {
      userId: insertId,
      email: trimmedEmail,
      role: userRole,
      isVerified: isVerified !== undefined ? Boolean(isVerified) : true,
      timestamp: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: insertId,
    });

  } catch (error: any) {
    console.error('[createUser] Error:', error.message);
    console.error('[createUser] Stack:', error.stack);

    return res.status(500).json({
      success: false,
      message: 'Failed to create user. Please try again later.',
      error: error.message,
    });
  }
};


// ============================================
// UPDATE USER ROLE
// ============================================
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    if (!['user', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role. Must be: user, instructor, or admin' 
      });
    }

    const currentUser = (req as any).user;
    if (currentUser.id === userId && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You cannot change your own role',
      });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await db
      .update(users)
      .set({ role: role })
      .where(eq(users.id, userId));

    console.log(`[updateUserRole] User ${userId} role changed to ${role}`);

    res.json({
      success: true,
      message: `User role updated to ${role}`,
    });
  } catch (error: any) {
    console.error('[updateUserRole] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user role',
      error: error.message 
    });
  }
};


// ============================================
// TOGGLE USER STATUS
// ============================================
export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const currentUser = (req as any).user;
    if (currentUser.id === userId) {
      return res.status(403).json({
        success: false,
        message: 'You cannot suspend yourself',
      });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newStatus = !user.is_verified;

    await db
      .update(users)
      .set({ is_verified: newStatus })
      .where(eq(users.id, userId));

    console.log(`[toggleUserStatus] User ${userId} ${newStatus ? 'activated' : 'suspended'}`);

    res.json({
      success: true,
      message: `User ${newStatus ? 'activated' : 'suspended'} successfully`,
      isActive: newStatus,
    });
  } catch (error: any) {
    console.error('[toggleUserStatus] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user status',
      error: error.message 
    });
  }
};


// ============================================
// DELETE USER
// ============================================
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const currentUser = (req as any).user;
    if (currentUser.id === userId) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete yourself',
      });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete user (this will cascade delete related records if FK constraints are set)
    await db.delete(users).where(eq(users.id, userId));

    console.log(`[deleteUser] User ${userId} (${user.email}) deleted`);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('[deleteUser] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user',
      error: error.message 
    });
  }

};