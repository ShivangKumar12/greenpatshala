const fs = require('fs');
const path = require('path');

const BACKEND_STRUCTURE = {
  'server/config': ['db.ts', 'email.ts', 'razorpay.ts', 'multer.ts', 'jwt.ts'],
  'server/middleware': ['auth.ts', 'roleCheck.ts', 'errorHandler.ts'],
  'server/routes': ['auth.routes.ts', 'payment.routes.ts', 'upload.routes.ts'],
  'server/controllers': ['authController.ts', 'paymentController.ts', 'uploadController.ts'],
  'uploads': ['images', 'videos', 'pdfs', 'thumbnails']
};

const FILE_TEMPLATES = {
  'server/config/db.ts': `import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const poolConnection = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'unchi_udaan',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const db = drizzle(poolConnection);

export const testConnection = async () => {
  try {
    const connection = await poolConnection.getConnection();
    console.log('✅ MySQL Database connected successfully!');
    console.log(\`📊 Database: \${process.env.DB_NAME || 'unchi_udaan'}\`);
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};`,

  'server/config/jwt.ts': `import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'dummy-jwt-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (userId: number, role: string): string => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};`,

  'server/middleware/auth.ts': `import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token.' 
      });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Authentication failed.' 
    });
  }
};`,

  'server/middleware/roleCheck.ts': `import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const checkRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access forbidden. Insufficient permissions.' 
      });
    }
    
    next();
  };
};

export const isAdmin = checkRole('admin');
export const isInstructor = checkRole('instructor', 'admin');
export const isUser = checkRole('user', 'instructor', 'admin');`,

  'server/middleware/errorHandler.ts': `import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};`,

  'server/controllers/authController.ts': `import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from '../config/jwt';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }
    
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUser.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const [result] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      emailVerificationToken: otp,
      isVerified: false
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'User registered. Please verify your email.',
      userId: result.insertId,
      email
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id, user.role);
    
    res.json({ 
      success: true, 
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};`,

  'server/routes/auth.routes.ts': `import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);

export default router;`,

  'server/routes/payment.routes.ts': `import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/create-order', authenticate, (req, res) => {
  res.json({ message: 'Payment route - TODO' });
});

export default router;`,

  'server/routes/upload.routes.ts': `import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/single', authenticate, (req, res) => {
  res.json({ message: 'Upload route - TODO' });
});

export default router;`,
};

function createFileWithContent(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

console.log('\\n🚀 Generating TypeScript Backend Structure...\\n');

Object.keys(BACKEND_STRUCTURE).forEach(folder => {
  BACKEND_STRUCTURE[folder].forEach(item => {
    const fullPath = path.join(folder, item);
    
    if (path.extname(item)) {
      const template = FILE_TEMPLATES[fullPath] || `// TODO: Implement ${item}\nexport {};`;
      createFileWithContent(fullPath, template);
      console.log(`✅ Created: ${fullPath}`);
    } else {
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`📁 Created folder: ${fullPath}`);
      }
    }
  });
});

console.log('\n✨ TypeScript backend generated!\n');