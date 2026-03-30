// server/config/jwt.ts - FIXED VERSION
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = (() => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters!');
  }
  return process.env.JWT_SECRET;
})();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ✅ FIXED: Use 'id' instead of 'userId' for consistency
export const generateToken = (userId: number, role: string): string => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): { id: number; role: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; role: string };
  } catch (error) {
    return null;
  }
};
