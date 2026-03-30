// server/controllers/authController.ts - PRODUCTION READY ✅ FIXED
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../config/db';
import { users } from '../../shared/schema';
import { eq, sql } from 'drizzle-orm'; // ✅ Added sql import
import { generateToken } from '../config/jwt';
import { sendOTPEmail, sendPasswordResetEmail } from '../config/email';

// ============================================
// SECURITY CONSTANTS
// ============================================
const BCRYPT_ROUNDS = 12;
const OTP_LENGTH = 6;
const PASSWORD_MIN_LENGTH = 8;
const RESET_TOKEN_LENGTH = 64;
const RESET_TOKEN_EXPIRY_HOURS = 1;
const ALLOWED_ROLES = ['user', 'instructor', 'admin'] as const;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================
// HELPER FUNCTIONS
// ============================================
const generateOTP = (): string => {
  return Math.floor(
    Math.pow(10, OTP_LENGTH - 1) + Math.random() * 9 * Math.pow(10, OTP_LENGTH - 1)
  ).toString();
};

const validatePasswordStrength = (password: string): { valid: boolean; message?: string } => {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return {
      valid: false,
      message: 'Password must contain uppercase, lowercase, and number',
    };
  }

  return { valid: true };
};

// ============================================
// REGISTER
// ============================================
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password, role = 'user' } = (req as any).body;

    if (!name || !email || !password) {
      return (res as any).status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password',
      });
    }

    const sanitizedEmail = email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(sanitizedEmail)) {
      return (res as any).status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      return (res as any).status(400).json({
        success: false,
        message: passwordCheck.message,
      });
    }

    const userRole = role.toLowerCase() as (typeof ALLOWED_ROLES)[number];
    if (!ALLOWED_ROLES.includes(userRole)) {
      return (res as any).status(400).json({
        success: false,
        message: 'Invalid role specified. Allowed roles: user, instructor, admin',
      });
    }

    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, sanitizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return (res as any).status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const isAutoVerified = userRole === 'admin' || userRole === 'instructor';
    const otp = isAutoVerified ? null : generateOTP();

    const [result]: any = await db.insert(users).values({
      name: name.trim(),
      email: sanitizedEmail,
      password: hashedPassword,
      role: userRole,
      email_verification_token: otp,
      is_verified: isAutoVerified,
    });

    if (!isAutoVerified && otp) {
      sendOTPEmail(sanitizedEmail, otp, name.trim()).catch((err) => {
        console.error('[EMAIL ERROR] Failed to send OTP:', {
          email: sanitizedEmail,
          error: err.message,
          timestamp: new Date().toISOString(),
        });
      });
    }

    const responseMessage = isAutoVerified
      ? `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} account created successfully!`
      : 'Registration successful! Please check your email for verification code.';

    return (res as any).status(201).json({
      success: true,
      message: responseMessage,
      userId: result.insertId,
      email: sanitizedEmail,
      requiresVerification: !isAutoVerified,
      ...(process.env.NODE_ENV === 'development' && !isAutoVerified && { devOtp: otp }),
    });
  } catch (error: any) {
    console.error('[REGISTER ERROR]', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return (res as any).status(500).json({
      success: false,
      message: 'Registration failed. Please try again later.',
    });
  }
};

// ============================================
// VERIFY OTP
// ============================================
export const verifyOTP = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, otp } = (req as any).body;

    if (!email || !otp) {
      return (res as any).status(400).json({
        success: false,
        message: 'Please provide both email and verification code',
      });
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedOtp = otp.toString().trim();

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatar: users.avatar,
        is_verified: users.is_verified,
        email_verification_token: users.email_verification_token,
      })
      .from(users)
      .where(eq(users.email, sanitizedEmail))
      .limit(1);

    if (!user) {
      return (res as any).status(404).json({
        success: false,
        message: 'No account found with this email',
      });
    }

    if (user.is_verified) {
      return (res as any).status(400).json({
        success: false,
        message: 'This email is already verified. You can log in now.',
      });
    }

    if (user.email_verification_token !== sanitizedOtp) {
      return (res as any).status(401).json({
        success: false,
        message: 'Invalid verification code. Please check and try again.',
      });
    }

    await db
      .update(users)
      .set({
        is_verified: true,
        email_verification_token: null,
      })
      .where(eq(users.email, sanitizedEmail));

    const token = generateToken(user.id, user.role);

    return (res as any).json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: true,
      },
    });
  } catch (error: any) {
    console.error('[VERIFY OTP ERROR]', {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return (res as any).status(500).json({
      success: false,
      message: 'Verification failed. Please try again.',
    });
  }
};

// ============================================
// RESEND OTP
// ============================================
export const resendOTP = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = (req as any).body;

    if (!email) {
      return (res as any).status(400).json({
        success: false,
        message: 'Please provide email address',
      });
    }

    const sanitizedEmail = email.toLowerCase().trim();

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        is_verified: users.is_verified,
      })
      .from(users)
      .where(eq(users.email, sanitizedEmail))
      .limit(1);

    if (!user) {
      return (res as any).status(404).json({
        success: false,
        message: 'No account found with this email',
      });
    }

    if (user.is_verified) {
      return (res as any).status(400).json({
        success: false,
        message: 'This email is already verified',
      });
    }

    const otp = generateOTP();

    await db
      .update(users)
      .set({ email_verification_token: otp })
      .where(eq(users.email, sanitizedEmail));

    try {
      await sendOTPEmail(sanitizedEmail, otp, user.name);
    } catch (emailError: any) {
      console.error('[EMAIL ERROR] Failed to send OTP:', emailError.message);
      return (res as any).status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.',
      });
    }

    return (res as any).json({
      success: true,
      message: 'Verification code sent successfully! Please check your email.',
      ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
    });
  } catch (error: any) {
    console.error('[RESEND OTP ERROR]', {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return (res as any).status(500).json({
      success: false,
      message: 'Failed to resend verification code. Please try again.',
    });
  }
};

// ============================================
// LOGIN
// ============================================
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = (req as any).body;

    if (!email || !password) {
      return (res as any).status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const sanitizedEmail = email.toLowerCase().trim();

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        password: users.password,
        role: users.role,
        avatar: users.avatar,
        phone: users.phone,
        bio: users.bio,
        is_verified: users.is_verified,
      })
      .from(users)
      .where(eq(users.email, sanitizedEmail))
      .limit(1);

    if (!user || !user.password) {
      return (res as any).status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return (res as any).status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Accepts 1, true, '1', 'true' as verified
    const isVerified = (() => {
      const v: any = user.is_verified;
      if (typeof v === 'boolean') return v;
      if (typeof v === 'number') return v === 1;
      if (typeof v === 'string') return v === '1' || v.toLowerCase() === 'true';
      return false;
    })();

    if (!isVerified) {
      return (res as any).status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = generateToken(user.id, user.role);

    return (res as any).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: true,
      },
    });
  } catch (error: any) {
    console.error('[LOGIN ERROR]', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return (res as any).status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
    });
  }
};

// ============================================
// GET ME
// ============================================
export const getMe = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return (res as any).status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatar: users.avatar,
        is_verified: users.is_verified,
        phone: users.phone,
        bio: users.bio,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return (res as any).status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return (res as any).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.is_verified,
        phone: user.phone,
        bio: user.bio,
      },
    });
  } catch (error: any) {
    console.error('[GET ME ERROR]', {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return (res as any).status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
    });
  }
};

// ============================================
// LOGOUT
// ============================================
export const logout = async (req: Request, res: Response): Promise<Response> => {
  return (res as any).json({
    success: true,
    message: 'Logged out successfully. Please remove your token.',
  });
};

// ============================================
// FORGOT PASSWORD
// ============================================
export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = (req as any).body;

    if (!email) {
      return (res as any).status(400).json({
        success: false,
        message: 'Please provide email address',
      });
    }

    const sanitizedEmail = email.toLowerCase().trim();

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.email, sanitizedEmail))
      .limit(1);

    if (!user) {
      return (res as any).json({
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.',
      });
    }

    const resetToken = crypto.randomBytes(RESET_TOKEN_LENGTH).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const expiryDate = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
    const resetTokenExpiry = expiryDate.toISOString().slice(0, 19).replace('T', ' ');

    await db
      .update(users)
      .set({
        reset_password_token: hashedToken,
        reset_password_expires: resetTokenExpiry,
      })
      .where(eq(users.email, sanitizedEmail));

    try {
      await sendPasswordResetEmail(sanitizedEmail, resetToken, user.name);
    } catch (emailError: any) {
      console.error('[EMAIL ERROR]', {
        email: sanitizedEmail,
        error: emailError.message,
      });
    }

    return (res as any).json({
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.',
      ...(process.env.NODE_ENV === 'development' && {
        devToken: resetToken,
        devTokenHash: hashedToken.substring(0, 20) + '...',
        devExpiry: resetTokenExpiry,
      }),
    });
  } catch (error: any) {
    console.error('[FORGOT PASSWORD ERROR]', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return (res as any).status(500).json({
      success: false,
      message: 'Failed to process request. Please try again.',
    });
  }
};

// ============================================
// RESET PASSWORD
// ============================================
export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { token, newPassword } = (req as any).body;

    if (!token || !newPassword) {
      return (res as any).status(400).json({
        success: false,
        message: 'Please provide reset token and new password',
      });
    }

    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      return (res as any).status(400).json({
        success: false,
        message: passwordCheck.message,
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const [user] = await db
      .select({
        id: users.id,
        reset_password_token: users.reset_password_token,
        reset_password_expires: users.reset_password_expires,
      })
      .from(users)
      .where(eq(users.reset_password_token, hashedToken))
      .limit(1);

    if (!user || !user.reset_password_expires) {
      return (res as any).status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    const expiryTime = new Date(user.reset_password_expires).getTime();
    const now = Date.now();

    if (now > expiryTime) {
      return (res as any).status(400).json({
        success: false,
        message: 'Reset token has expired. Please request a new one.',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        reset_password_token: null,
        reset_password_expires: null,
      })
      .where(eq(users.id, user.id));

    return (res as any).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (error: any) {
    console.error('[RESET PASSWORD ERROR]', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return (res as any).status(500).json({
      success: false,
      message: 'Failed to reset password. Please try again.',
    });
  }
};

// ============================================
// UPDATE PROFILE
// ============================================
export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const { name, email } = (req as any).body;

    if (!userId) {
      return (res as any).status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!name || !email) {
      return (res as any).status(400).json({
        success: false,
        message: 'Please provide name and email',
      });
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = name.trim();

    if (!EMAIL_REGEX.test(sanitizedEmail)) {
      return (res as any).status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, sanitizedEmail))
      .limit(1);

    if (existingUser && existingUser.id !== userId) {
      return (res as any).status(409).json({
        success: false,
        message: 'This email is already in use by another account',
      });
    }

    await db
      .update(users)
      .set({
        name: sanitizedName,
        email: sanitizedEmail,
      })
      .where(eq(users.id, userId));

    console.log('[UPDATE PROFILE] Success for user:', userId);

    return (res as any).json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    console.error('[UPDATE PROFILE ERROR]', {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return (res as any).status(500).json({
      success: false,
      message: 'Failed to update profile. Please try again.',
    });
  }
};

// ============================================
// CHANGE PASSWORD
// ============================================
export const changePassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const { currentPassword, newPassword } = (req as any).body;

    if (!userId) {
      return (res as any).status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!currentPassword || !newPassword) {
      return (res as any).status(400).json({
        success: false,
        message: 'Please provide current password and new password',
      });
    }

    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      return (res as any).status(400).json({
        success: false,
        message: passwordCheck.message,
      });
    }

    const [user] = await db
      .select({ id: users.id, password: users.password })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.password) {
      return (res as any).status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return (res as any).status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));

    console.log('[CHANGE PASSWORD] Success for user:', userId);

    return (res as any).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    console.error('[CHANGE PASSWORD ERROR]', {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return (res as any).status(500).json({
      success: false,
      message: 'Failed to change password. Please try again.',
    });
  }
};

// ============================================
// ENABLE 2FA - ✅ FIXED
// ============================================
export const enable2FA = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return (res as any).status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const secret = crypto.randomBytes(20).toString('hex');

    // ✅ CORRECT RAW SQL SYNTAX
    await db.execute(
      sql`UPDATE users SET two_factor_enabled = 1, two_factor_secret = ${secret} WHERE id = ${userId}`
    );

    console.log('[ENABLE 2FA] Success for user:', userId);

    return (res as any).json({
      success: true,
      message: '2FA has been enabled for your account',
    });
  } catch (error: any) {
    console.error('[ENABLE 2FA ERROR]', {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return (res as any).status(500).json({
      success: false,
      message: 'Failed to enable 2FA. Please try again.',
    });
  }
};

// ============================================
// DISABLE 2FA - ✅ FIXED
// ============================================
export const disable2FA = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return (res as any).status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    await db.execute(
      sql`UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL WHERE id = ${userId}`
    );

    console.log('[DISABLE 2FA] Success for user:', userId);

    return (res as any).json({
      success: true,
      message: '2FA has been disabled for your account',
    });
  } catch (error: any) {
    console.error('[DISABLE 2FA ERROR]', {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return (res as any).status(500).json({
      success: false,
      message: 'Failed to disable 2FA. Please try again.',
    });
  }
};

// ============================================
// UPDATE NOTIFICATION PREFERENCES - ✅ FIXED
// ============================================
export const updateNotificationPreferences = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const preferences = (req as any).body;

    if (!userId) {
      return (res as any).status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const validKeys = ['emailNotifications', 'courseUpdates', 'quizReminders'];
    const hasValidKey = Object.keys(preferences).some((key) => validKeys.includes(key));

    if (!hasValidKey) {
      return (res as any).status(400).json({
        success: false,
        message: 'Invalid notification preference provided',
      });
    }

    // ✅ BUILD UPDATE QUERY WITH RAW SQL
    // Build update object only with provided values
    const updateData: any = {};
    if ('emailNotifications' in preferences) {
      updateData.email_notifications = Boolean(preferences.emailNotifications);
    }
    if ('courseUpdates' in preferences) {
      updateData.course_updates = Boolean(preferences.courseUpdates);
    }
    if ('quizReminders' in preferences) {
      updateData.quiz_reminders = Boolean(preferences.quizReminders);
    }

    if (Object.keys(updateData).length === 0) {
      return (res as any).status(400).json({
        success: false,
        message: 'No updates provided',
      });
    }

    // Use Drizzle ORM parameterized update
    await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId));

    return (res as any).json({
      success: true,
      message: 'Notification preferences updated',
    });
  } catch (error: any) {
    console.error('[UPDATE NOTIFICATION PREFERENCES ERROR]', {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return (res as any).status(500).json({
      success: false,
      message: 'Failed to update preferences. Please try again.',
    });
  }
};

// ============================================
// GET NOTIFICATION PREFERENCES - ✅ FIXED
// ============================================
export const getNotificationPreferences = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return (res as any).status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // ✅ USE RAW SQL TO BYPASS CACHE
    const result: any = await db.execute(
      sql`SELECT email_notifications, course_updates, quiz_reminders, two_factor_enabled FROM users WHERE id = ${userId} LIMIT 1`
    );

    const user = result[0]?.[0];

    if (!user) {
      return (res as any).status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return (res as any).json({
      success: true,
      preferences: {
        emailNotifications: !!user.email_notifications,
        courseUpdates: !!user.course_updates,
        quizReminders: !!user.quiz_reminders,
        twoFactorEnabled: !!user.two_factor_enabled,
      },
    });
  } catch (error: any) {
    console.error('[GET NOTIFICATION PREFERENCES ERROR]', {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return (res as any).status(500).json({
      success: false,
      message: 'Failed to fetch preferences. Please try again.',
    });
  }
};
