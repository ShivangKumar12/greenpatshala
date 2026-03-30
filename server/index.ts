// server/index.ts - WITH GOOGLE OAUTH
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import session from 'express-session';
import { testConnection } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { setupGoogleAuth } from './middleware/passport';

// ============================================
// IMPORT ROUTES
// ============================================
import authRoutes from './routes/auth.routes';
import paymentRoutes from './routes/payment.routes';
import uploadRoutes from './routes/upload.routes';
import courseRoutes from './routes/course.routes';
import adminCourseRoutes from './routes/adminCourseRoutes';
import categoryRoutes from './routes/category.routes';
import lessonRoutes from './routes/lesson.routes';
import quizRoutes from './routes/quiz.routes';
import adminQuizRoutes from './routes/adminQuizRoutes';
import jobRoutes from './routes/job.routes';
import currentAffairsRoutes from './routes/currentAffairs.routes';
import studyMaterialsRoutes from './routes/studyMaterials.routes';
import userManagementRoutes from './routes/userManagement.routes';
import settingsRoutes from './routes/settings.routes';
import adminPaymentRoutes from './routes/adminPayment.routes';
import feedbackRoutes from './routes/feedback.routes';
import testimonialRoutes from './routes/testimonial.routes';
import adminStatsRoutes from './routes/adminStats.routes';
import couponRoutes from './routes/coupon.routes';
import adminLessonRoutes from './routes/adminLesson.routes';
import instructorRoutes from './routes/instructor.routes';

dotenv.config();

const app = express();
import csrf from 'csurf';
const PORT = process.env.PORT || 5001;

// ============================================
// ENSURE UPLOAD DIRECTORIES EXIST
// ============================================
const uploadDirs = [
  path.join(__dirname, '../uploads/study-materials'),
  path.join(__dirname, '../uploads/current-affairs'),
  path.join(__dirname, '../uploads/courses'),
  path.join(__dirname, '../uploads/quizzes'),
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
// CSRF Protection
const csrfProtection = csrf({ cookie: false });
app.post('*', csrfProtection);
app.put('*', csrfProtection);
app.delete('*', csrfProtection);
app.patch('*', csrfProtection);
app.use((req, res, next) => {
  if (req.csrfToken) {
    res.locals.csrfToken = req.csrfToken();
  }
  next();
});
app.use(cookieParser());

// ✅ SESSION CONFIGURATION (Required for Passport)
app.use(
  session({
    secret: (() => {
      if (!process.env.SESSION_SECRET) {
        throw new Error('❌ SESSION_SECRET environment variable is required');
      }
      return process.env.SESSION_SECRET;
    })(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// ✅ INITIALIZE PASSPORT
app.use(passport.initialize());
app.use(passport.session());
setupGoogleAuth();

// Serve uploaded files (must be before routes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// API ROUTES
// ============================================

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to Unchi Udaan API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      courses: '/api/courses',
      quizzes: '/api/quizzes',
      jobs: '/api/jobs',
      currentAffairs: '/api/current-affairs',
      studyMaterials: '/api/study-materials',
      payment: '/api/payment',
      upload: '/api/upload',
      settings: '/api/settings/public',
      instructor: {
        stats: '/api/instructor/stats',
        profile: '/api/instructor/profile',
        courses: '/api/instructor/courses/recent',
        quizzes: '/api/instructor/quizzes/recent',
      },
      admin: {
        courses: '/api/admin/courses',
        quizzes: '/api/admin/quizzes',
        users: '/api/admin/users',
        settings: '/api/admin/settings',
      },
    },
  });
});

// ============================================
// PUBLIC ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api', quizRoutes);
app.use('/api', jobRoutes);
app.use('/api/current-affairs', currentAffairsRoutes);
app.use('/api/study-materials', studyMaterialsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/instructor', instructorRoutes);

// ============================================
// ADMIN ROUTES
// ============================================
app.use('/api/admin/courses', adminCourseRoutes);
app.use('/api/admin/quizzes', adminQuizRoutes);
app.use('/api/admin/users', userManagementRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);
app.use('/api/admin', adminStatsRoutes);
app.use('/api', couponRoutes);
app.use('/api/admin/lessons', adminLessonRoutes);

// ============================================
// ERROR HANDLERS
// ============================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: '/api',
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 Unchi Udaan Server Started Successfully!');
      console.log('='.repeat(60));
      console.log(`📡 API Server:     http://localhost:${PORT}/api`);
      console.log(`💻 Environment:    ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database:       ${process.env.DB_NAME || 'unchi_udaan'}`);
      console.log(`📁 Uploads:        ${path.join(__dirname, '../uploads')}`);
      console.log(`🔐 Google OAuth:   ENABLED ✅`);
      console.log('='.repeat(60));
      console.log('\n📋 Available Endpoints:');
      console.log('   ✅ Auth:             /api/auth');
      console.log('   ✅ Google OAuth:     /api/auth/google 🆕');
      console.log('   ✅ Courses:          /api/courses');
      console.log('   ✅ Quizzes:          /api/quizzes');
      console.log('   ✅ Jobs:             /api/jobs');
      console.log('   ✅ Current Affairs:  /api/current-affairs');
      console.log('   ✅ Study Materials:  /api/study-materials');
      console.log('   ✅ Payment:          /api/payment');
      console.log('   ✅ Upload:           /api/upload');
      console.log('   ✅ Settings:         /api/settings/public');
      console.log('   ✅ Health:           /api/health');
      console.log('\n🔐 Admin Endpoints:');
      console.log('   ✅ Admin Courses:    /api/admin/courses');
      console.log('   ✅ Admin Quizzes:    /api/admin/quizzes');
      console.log('   ✅ Admin Users:      /api/admin/users');
      console.log('   ✅ Admin Settings:   /api/admin/settings');
      console.log('='.repeat(60) + '\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
