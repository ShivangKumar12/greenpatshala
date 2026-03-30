// server/controllers/instructorController.ts - PROFILE MANAGEMENT ONLY
import { Request, Response } from 'express';
import { db } from '../config/db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// ============================================
// STATS FUNCTIONS REMOVED
// Now handled by adminStatsController.ts with role-based filtering
// ============================================

// ============================================
// GET INSTRUCTOR PROFILE
// ============================================
export const getInstructorProfile = async (req: Request, res: Response) => {
  try {
    const instructorId = (req as any).userId;

    const [instructor] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        bio: users.bio,
        avatar: users.avatar,
        role: users.role,
        is_verified: users.is_verified,
      })
      .from(users)
      .where(eq(users.id, instructorId))
      .limit(1);

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found',
      });
    }

    return res.json({
      success: true,
      instructor,
    });
  } catch (error) {
    console.error('[GET INSTRUCTOR PROFILE ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch instructor profile',
    });
  }
};

// ============================================
// UPDATE INSTRUCTOR PROFILE
// ============================================
export const updateInstructorProfile = async (req: Request, res: Response) => {
  try {
    const instructorId = (req as any).userId;
    const { name, phone, bio, avatar } = req.body;

    // Validate required fields
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long',
      });
    }

    // Validate phone (optional but if provided, must be valid)
    if (phone && !/^\+?[1-9]\d{9,14}$/.test(phone.replace(/\s+/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format',
      });
    }

    // Update profile
    await db
      .update(users)
      .set({
        name: name.trim(),
        phone: phone?.trim() || null,
        bio: bio?.trim() || null,
        avatar: avatar?.trim() || null,
        updated_at: new Date(),
      })
      .where(eq(users.id, instructorId));

    // Fetch updated profile
    const [updatedInstructor] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        bio: users.bio,
        avatar: users.avatar,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, instructorId))
      .limit(1);

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      instructor: updatedInstructor,
    });
  } catch (error) {
    console.error('[UPDATE INSTRUCTOR PROFILE ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};

// ============================================
// CHANGE PASSWORD
// ============================================
export const changePassword = async (req: Request, res: Response) => {
  try {
    const instructorId = (req as any).userId;
    const { currentPassword, newPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    // Get current user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, instructorId))
      .limit(1);

    if (!user || !user.password) {
      return res.status(404).json({
        success: false,
        message: 'User not found or password not set',
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updated_at: new Date(),
      })
      .where(eq(users.id, instructorId));

    return res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('[CHANGE PASSWORD ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password',
    });
  }
};
