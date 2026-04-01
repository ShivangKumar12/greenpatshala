// server/index.ts - WITH GOOGLE OAUTH + SOCKET.IO
import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import rateLimit from 'express-rate-limit';
import { testConnection, poolConnection } from './config/db';
import { connectRedis, redisPub, redisSub, redis, isRedisAvailable, disconnectRedis } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import { setupGoogleAuth } from './middleware/passport';
import { registerSocketHandlers } from './config/socketHandler';

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
import certificateRoutes from './routes/certificate.routes';
import subjectRoutes from './routes/subject.routes';
import chapterRoutes from './routes/chapter.routes';
import subcategoryRoutes from './routes/subcategory.routes';
import mobileSettingsRoutes from './routes/mobileSettings.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ============================================
// HTTP SERVER + SOCKET.IO
// ============================================
const httpServer = createServer(app);

const io = new IOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 20000,
  maxHttpBufferSize: 1e6,       // 1 MB max message size
  connectTimeout: 45000,        // 45s handshake timeout
  allowEIO3: true,              // backward compat
});

// Trust proxy (Hostinger CDN / Nginx terminates SSL)
app.set('trust proxy', 1);

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
// ✅ BUG-004 FIX: Add Helmet security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP to avoid breaking frontend
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// ✅ Session config — middleware is mounted inside startServer() AFTER Redis connects
const sessionConfig: session.SessionOptions = {
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
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : false,
  },
};

// NOTE: session + passport middleware are mounted in startServer() after Redis store is resolved

// ✅ BUG-003 FIX: Rate limiting on sensitive auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});

// Serve uploaded files (must be before routes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// API ROUTES
// ============================================

// Health check endpoint (registered early — no session needed)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    redis: isRedisAvailable() ? 'connected' : 'disconnected',
  });
});

// Root API endpoint
app.get('/api', (req: Request, res: Response) => {
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
// SERVE FRONTEND STATIC ASSETS (PRODUCTION ONLY)
// ============================================
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist/public')));
}

// ============================================
// PUBLIC ROUTES
// ============================================
// ✅ Apply rate limiters to sensitive routes
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/resend-otp', authLimiter);

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
app.use('/api/certificates', certificateRoutes);
app.use('/api/test-subjects', subjectRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/mobile-settings', mobileSettingsRoutes);

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
app.use('/api/admin/test-chapters', chapterRoutes);
app.use('/api/admin/mobile-settings', mobileSettingsRoutes);

// ============================================
// SPA CATCH-ALL (MUST BE AFTER ALL API ROUTES)
// ============================================
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    // Only serve index.html for non-API, non-upload routes
    if (!req.path.startsWith('/api/') && !req.path.startsWith('/uploads/')) {
      res.sendFile(path.join(__dirname, '../dist/public/index.html'));
    } else {
      next();
    }
  });
}

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

    // Connect to Redis for caching + Socket.io adapter + sessions
    const redisOk = await connectRedis();

    // ✅ FIX: Attach Redis session store BEFORE mounting session middleware
    if (redisOk && isRedisAvailable()) {
      sessionConfig.store = new RedisStore({
        client: redis,
        prefix: 'sess:',
      });
      console.log('✅ Session store: Redis');
    } else {
      console.warn('⚠️  Session store: in-memory (not recommended for production)');
    }

    // ✅ FIX: Mount session + passport AFTER store is resolved (prevents MemoryStore fallback)
    app.use(session(sessionConfig));
    app.use(passport.initialize());
    app.use(passport.session());
    setupGoogleAuth();
    console.log('✅ Session & Passport middleware mounted');

    // Attach Redis adapter for Socket.io horizontal scaling
    if (redisOk && isRedisAvailable()) {
      io.adapter(createAdapter(redisPub, redisSub));
      console.log('✅ Socket.io Redis adapter attached (horizontal scaling enabled)');
    } else {
      console.warn('⚠️  Socket.io running without Redis adapter — single-process only');
    }

    // Register Socket.io event handlers (quiz rooms, active-user counters)
    registerSocketHandlers(io);
    console.log('✅ Socket.io handlers registered');

    httpServer.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 GreenPatshala Server Started Successfully!');
      console.log('='.repeat(60));
      console.log(`📡 API Server:     http://localhost:${PORT}/api`);
      console.log(`🔌 Socket.io:      ws://localhost:${PORT}/socket.io/`);
      console.log(`💻 Environment:    ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database:       ${process.env.DB_NAME || 'unchi_udaan'}`);
      console.log(`📁 Uploads:        ${path.join(__dirname, '../uploads')}`);
      console.log(`🔐 Google OAuth:   ENABLED ✅`);
      console.log(`🛡️  Helmet:         ENABLED ✅`);
      console.log(`⏱️  Rate Limiting:  ENABLED ✅`);
      console.log('='.repeat(60) + '\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ============================================
// ✅ BUG-013 FIX: GRACEFUL SHUTDOWN
// ============================================
const gracefulShutdown = async (signal: string) => {
  console.log(`\n⚠️  Received ${signal}. Starting graceful shutdown...`);

  // Stop accepting new connections
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
  });

  // Close Socket.io
  io.close(() => {
    console.log('✅ Socket.io closed');
  });

  // Disconnect Redis
  try {
    await disconnectRedis();
  } catch (e) {
    // ignore
  }

  // Drain DB pool
  try {
    await poolConnection.end();
    console.log('✅ Database pool closed');
  } catch (e) {
    // ignore
  }

  // Force exit after 30s if graceful shutdown hangs
  setTimeout(() => {
    console.error('❌ Graceful shutdown timed out. Force exiting.');
    process.exit(1);
  }, 30000).unref();

  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================
// ✅ BUG-014 FIX: CRASH HANDLERS
// ============================================
process.on('unhandledRejection', (reason: any) => {
  console.error('❌ Unhandled Promise Rejection:', reason?.message || reason);
  // Don't crash — log and continue
});

process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error(error.stack);
  // Attempt graceful shutdown
  gracefulShutdown('uncaughtException');
});

startServer();

export default app;
