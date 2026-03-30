const fs = require('fs');
const path = require('path');

// ============================================
// BACKEND FOLDER STRUCTURE
// ============================================
const BACKEND_STRUCTURE = {
  'server/config': [
    'db.js',
    'email.js',
    'razorpay.js',
    'multer.js',
    'jwt.js'
  ],
  'server/middleware': [
    'auth.js',
    'roleCheck.js',
    'upload.js',
    'errorHandler.js',
    'validator.js'
  ],
  'server/routes': [
    'auth.routes.js',
    'course.routes.js',
    'quiz.routes.js',
    'payment.routes.js',
    'upload.routes.js',
    'user.routes.js',
    'job.routes.js',
    'material.routes.js',
    'currentAffair.routes.js'
  ],
  'server/controllers': [
    'authController.js',
    'courseController.js',
    'quizController.js',
    'paymentController.js',
    'uploadController.js',
    'userController.js',
    'jobController.js',
    'materialController.js',
    'currentAffairController.js'
  ],
  'server/services': [
    'emailService.js',
    'pdfService.js',
    'fileService.js'
  ],
  'server/utils': [
    'generateToken.js',
    'hashPassword.js',
    'asyncHandler.js',
    'ApiError.js',
    'ApiResponse.js'
  ],
  'uploads': ['images', 'videos', 'pdfs', 'thumbnails', 'temp']
};

// ============================================
// FILE TEMPLATES
// ============================================
const FILE_TEMPLATES = {
  // CONFIG FILES
  'server/config/db.js': `const { drizzle } = require('drizzle-orm/mysql2');
const mysql = require('mysql2/promise');
require('dotenv').config();

const poolConnection = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'unchi_udaan',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const db = drizzle(poolConnection);

const testConnection = async () => {
  try {
    const connection = await poolConnection.getConnection();
    console.log('✅ MySQL Database connected successfully!');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = { db, testConnection, poolConnection };`,

  'server/config/email.js': `const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Unchi Udaan <noreply@unchiudaan.com>',
      to,
      subject,
      html,
    });
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error };
  }
};

const sendOTPEmail = async (email, otp) => {
  const html = \`
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
      <h2 style="color: #0066FF;">Email Verification - Unchi Udaan</h2>
      <p>Your OTP for email verification is:</p>
      <h1 style="color: #0066FF; font-size: 32px; letter-spacing: 5px;">\${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
      <p style="color: #666;">If you didn't request this, please ignore this email.</p>
      <hr style="margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">© 2024 Unchi Udaan. All rights reserved.</p>
    </div>
  \`;
  
  return sendEmail(email, 'Email Verification OTP - Unchi Udaan', html);
};

const sendWelcomeEmail = async (email, name) => {
  const html = \`
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Welcome to Unchi Udaan, \${name}! 🎉</h2>
      <p>Thank you for joining us. Start your learning journey today!</p>
    </div>
  \`;
  
  return sendEmail(email, 'Welcome to Unchi Udaan', html);
};

module.exports = { transporter, sendEmail, sendOTPEmail, sendWelcomeEmail };`,

  'server/config/razorpay.js': `const Razorpay = require('razorpay');
require('dotenv').config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

console.log('✅ Razorpay instance initialized');

module.exports = { razorpayInstance };`,

  'server/config/multer.js': `const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories
const uploadDirs = [
  'uploads/images',
  'uploads/videos',
  'uploads/pdfs',
  'uploads/thumbnails',
  'uploads/temp'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(\`✅ Created directory: \${dir}\`);
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/images';
    
    if (file.mimetype.startsWith('video/')) {
      uploadPath = 'uploads/videos';
    } else if (file.mimetype === 'application/pdf') {
      uploadPath = 'uploads/pdfs';
    } else if (file.fieldname === 'thumbnail') {
      uploadPath = 'uploads/thumbnails';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|avi|mov|wmv/;
  const allowedDocTypes = /pdf|doc|docx/;
  
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  
  const isImage = allowedImageTypes.test(ext) && file.mimetype.startsWith('image/');
  const isVideo = allowedVideoTypes.test(ext) && file.mimetype.startsWith('video/');
  const isDoc = allowedDocTypes.test(ext);
  
  if (isImage || isVideo || isDoc) {
    cb(null, true);
  } else {
    cb(new Error(\`Invalid file type. Allowed: images (jpg, png, gif, webp), videos (mp4, avi), documents (pdf, doc)\`));
  }
};

const upload = multer({
  storage,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter
});

module.exports = { upload };`,

  'server/config/jwt.js': `const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'dummy-jwt-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };`,

  // MIDDLEWARE FILES
  'server/middleware/auth.js': `const { verifyToken } = require('../config/jwt');

const authenticate = (req, res, next) => {
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
};

module.exports = { authenticate };`,

  'server/middleware/roleCheck.js': `const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
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

const isAdmin = checkRole('admin');
const isInstructor = checkRole('instructor', 'admin');
const isUser = checkRole('user', 'instructor', 'admin');

module.exports = { checkRole, isAdmin, isInstructor, isUser };`,

  'server/middleware/errorHandler.js': `const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
};

module.exports = { errorHandler };`,

  'server/middleware/validator.js': `// TODO: Add validation middleware using express-validator or zod
module.exports = {};`,

  'server/middleware/upload.js': `const { upload } = require('../config/multer');

module.exports = { upload };`,

  // CONTROLLER FILES
  'server/controllers/authController.js': `const bcrypt = require('bcryptjs');
const { db } = require('../config/db');
const { users } = require('../../shared/schema');
const { eq } = require('drizzle-orm');
const { generateToken } = require('../config/jwt');
const { sendOTPEmail, sendWelcomeEmail } = require('../config/email');

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }
    
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUser.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create user
    const [result] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      emailVerificationToken: otp,
      isVerified: false
    });
    
    // Send OTP email
    await sendOTPEmail(email, otp);
    
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully. Please verify your email.',
      userId: result.insertId,
      email
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }
    
    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    // Check if verified
    if (!user.isVerified) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please verify your email first' 
      });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password || '');
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    // Generate token
    const token = generateToken(user.id, user.role);
    
    res.json({ 
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.' 
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and OTP' 
      });
    }
    
    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Verify OTP
    if (user.emailVerificationToken !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }
    
    // Update user as verified
    await db.update(users)
      .set({ 
        isVerified: true, 
        emailVerificationToken: null 
      })
      .where(eq(users.email, email));
    
    // Send welcome email
    await sendWelcomeEmail(email, user.name);
    
    // Generate token
    const token = generateToken(user.id, user.role);
    
    res.json({ 
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: true
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'OTP verification failed' 
    });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already verified' 
      });
    }
    
    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update OTP
    await db.update(users)
      .set({ emailVerificationToken: otp })
      .where(eq(users.email, email));
    
    // Send OTP email
    await sendOTPEmail(email, otp);
    
    res.json({ 
      success: true, 
      message: 'OTP sent successfully' 
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to resend OTP' 
    });
  }
};

module.exports = {
  register,
  login,
  verifyOTP,
  resendOTP
};`,

  'server/controllers/paymentController.js': `const { razorpayInstance } = require('../config/razorpay');
const crypto = require('crypto');
const { db } = require('../config/db');
// TODO: Import payments and enrollments from schema

const createOrder = async (req, res) => {
  try {
    const { amount, courseId, courseName } = req.body;
    const userId = req.user?.userId;
    
    if (!amount || !courseId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount and course ID are required' 
      });
    }
    
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: \`receipt_\${Date.now()}\`,
      notes: { 
        courseId,
        courseName: courseName || '',
        userId: userId || 'guest'
      }
    };
    
    const order = await razorpayInstance.orders.create(options);
    
    res.json({ 
      success: true,
      message: 'Order created successfully',
      order,
      key: process.env.RAZORPAY_KEY_ID 
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create order' 
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      courseId 
    } = req.body;
    
    const userId = req.user?.userId;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing payment details' 
      });
    }
    
    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');
    
    if (razorpay_signature === expectedSign) {
      // TODO: Save payment to database
      // TODO: Enroll user in course
      
      res.json({ 
        success: true, 
        message: 'Payment verified successfully',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid payment signature' 
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment verification failed' 
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment
};`,

  'server/controllers/uploadController.js': `const path = require('path');
const fs = require('fs');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }
    
    const fileUrl = \`/uploads/\${path.basename(path.dirname(req.file.path))}/\${req.file.filename}\`;
    
    res.json({ 
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'File upload failed' 
    });
  }
};

const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files uploaded' 
      });
    }
    
    const files = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: \`/uploads/\${path.basename(path.dirname(file.path))}/\${file.filename}\`,
      path: file.path
    }));
    
    res.json({ 
      success: true,
      message: 'Files uploaded successfully',
      files
    });
  } catch (error) {
    console.error('Upload multiple error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'File upload failed' 
    });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { filepath } = req.body;
    
    if (!filepath) {
      return res.status(400).json({ 
        success: false, 
        message: 'File path is required' 
      });
    }
    
    // Security check - ensure file is in uploads directory
    if (!filepath.startsWith('uploads/')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid file path' 
      });
    }
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ 
        success: true, 
        message: 'File deleted successfully' 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'File not found' 
      });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'File deletion failed' 
    });
  }
};

module.exports = {
  uploadFile,
  uploadMultiple,
  deleteFile
};`,

  // ROUTES FILES
  'server/routes/auth.routes.js': `const express = require('express');
const { register, login, verifyOTP, resendOTP } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// TODO: Add forgot-password and reset-password routes

module.exports = router;`,

  'server/routes/payment.routes.js': `const express = require('express');
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/create-order', authenticate, createOrder);
router.post('/verify', authenticate, verifyPayment);

module.exports = router;`,

  'server/routes/upload.routes.js': `const express = require('express');
const { uploadFile, uploadMultiple, deleteFile } = require('../controllers/uploadController');
const { upload } = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const { isInstructor } = require('../middleware/roleCheck');

const router = express.Router();

// Single file upload
router.post('/single', authenticate, isInstructor, upload.single('file'), uploadFile);

// Multiple files upload
router.post('/multiple', authenticate, isInstructor, upload.array('files', 10), uploadMultiple);

// Delete file
router.delete('/delete', authenticate, isInstructor, deleteFile);

module.exports = router;`,

  // UTILS FILES
  'server/utils/asyncHandler.js': `const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler };`,

  'server/utils/ApiError.js': `class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
  }
}

module.exports = { ApiError };`,

  'server/utils/ApiResponse.js': `class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

module.exports = { ApiResponse };`,
};

// ============================================
// HELPER FUNCTIONS
// ============================================
function createFileWithContent(filePath, content) {
  const dir = path.dirname(filePath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Create file with content
  fs.writeFileSync(filePath, content, 'utf8');
}

// ============================================
// MAIN GENERATOR FUNCTION
// ============================================
function generateBackendStructure() {
  console.log('\n🚀 Generating Complete Backend Structure...\n');
  console.log('='.repeat(50));
  
  let fileCount = 0;
  let folderCount = 0;
  
  // Create folders and files
  Object.keys(BACKEND_STRUCTURE).forEach(folder => {
    const items = BACKEND_STRUCTURE[folder];
    
    items.forEach(item => {
      const fullPath = path.join(folder, item);
      
      // Check if it's a file (has extension) or subfolder
      if (path.extname(item)) {
        // It's a file
        if (!fs.existsSync(fullPath)) {
          const template = FILE_TEMPLATES[fullPath] || `// TODO: Implement ${item}\nmodule.exports = {};\n`;
          createFileWithContent(fullPath, template);
          console.log(`✅ Created: ${fullPath}`);
          fileCount++;
        } else {
          console.log(`⏭️  Skipped (exists): ${fullPath}`);
        }
      } else {
        // It's a subfolder (for uploads)
        const subFolder = path.join(folder, item);
        if (!fs.existsSync(subFolder)) {
          fs.mkdirSync(subFolder, { recursive: true });
          console.log(`📁 Created folder: ${subFolder}`);
          folderCount++;
        }
      }
    });
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n✨ Backend structure generated successfully!`);
  console.log(`📊 Summary: ${fileCount} files and ${folderCount} folders created\n`);
  
  console.log('📋 Next Steps:');
  console.log('1️⃣  Install dependencies:');
  console.log('   npm install mysql2 drizzle-orm bcryptjs jsonwebtoken razorpay nodemailer multer express dotenv cors cookie-parser');
  console.log('\n2️⃣  Create .env file with your credentials');
  console.log('3️⃣  Update shared/schema.js with database tables');
  console.log('4️⃣  Run: npm run db:push (to create tables)');
  console.log('5️⃣  Start server: npm run dev\n');
}

// ============================================
// RUN SCRIPT
// ============================================
if (require.main === module) {
  generateBackendStructure();
}

module.exports = { generateBackendStructure };
