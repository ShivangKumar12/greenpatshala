// shared/schema.ts - ✅ MATCHES YOUR ACTUAL DATABASE
import { mysqlTable, int, varchar, text, boolean, timestamp, decimal, json, datetime, tinyint } from 'drizzle-orm/mysql-core';

// ============================================
// USERS TABLE - ✅ EXACTLY MATCHES YOUR DATABASE
// ============================================
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  avatar: varchar('avatar', { length: 500 }),
  phone: varchar('phone', { length: 20 }),
  bio: text('bio'),

  is_verified: boolean('is_verified').notNull().default(false),
  is_active: boolean('is_active').notNull().default(true),

  email_verification_token: varchar('email_verification_token', { length: 10 }),
  // ✅ BUG-005 FIX: OTP expiry timestamp
  email_verification_expires: datetime('email_verification_expires', { mode: 'string' }),

  // ✅ CORRECT: reset_password_token (not password_reset_token)
  reset_password_token: varchar('reset_password_token', { length: 255 }),
  reset_password_expires: datetime('reset_password_expires', { mode: 'string' }),

  google_id: varchar('google_id', { length: 255 }),

  // ✅ BUG-023 FIX: 2FA columns
  two_factor_enabled: boolean('two_factor_enabled').notNull().default(false),
  two_factor_secret: varchar('two_factor_secret', { length: 255 }),

  // ✅ BUG-024 FIX: Notification preference columns
  email_notifications: boolean('email_notifications').notNull().default(true),
  course_updates: boolean('course_updates').notNull().default(true),
  quiz_reminders: boolean('quiz_reminders').notNull().default(true),

  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  last_login_at: timestamp('last_login_at'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ============================================
// CATEGORIES TABLE
// ============================================
export const categories = mysqlTable('categories', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 150 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

// ============================================
// SUBCATEGORIES TABLE
// ============================================
export const subcategories = mysqlTable('subcategories', {
  id: int('id').primaryKey().autoincrement(),
  categoryId: int('category_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 150 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  orderIndex: int('order_index').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type Subcategory = typeof subcategories.$inferSelect;
export type NewSubcategory = typeof subcategories.$inferInsert;

// ============================================
// COURSES TABLE
// ============================================
export const courses = mysqlTable('courses', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),
  thumbnail: varchar('thumbnail', { length: 500 }),
  videoUrl: varchar('video_url', { length: 500 }),
  instructorId: int('instructor_id').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  level: varchar('level', { length: 50 }).notNull(),
  duration: varchar('duration', { length: 100 }).notNull(),
  language: varchar('language', { length: 100 }).notNull().default('Hindi & English'),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }).notNull(),
  discountPrice: decimal('discount_price', { precision: 10, scale: 2 }),
  isFree: boolean('is_free').notNull().default(false),
  isPublished: boolean('is_published').notNull().default(false),
  isFeatured: boolean('is_featured').notNull().default(false),
  totalLessons: int('total_lessons').notNull().default(0),
  totalStudents: int('total_students').notNull().default(0),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0.00'),
  totalReviews: int('total_reviews').notNull().default(0),
  syllabus: json('syllabus'),
  features: json('features'),
  requirements: json('requirements'),
  certificateEligible: boolean('certificate_eligible').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

// ============================================
// MODULES TABLE
// ============================================
export const modules = mysqlTable('modules', {
  id: int('id').primaryKey().autoincrement(),
  courseId: int('course_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  orderIndex: int('order_index').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;

// ============================================
// LESSONS TABLE
// ============================================
export const lessons = mysqlTable('lessons', {
  id: int('id').primaryKey().autoincrement(),
  moduleId: int('module_id').notNull(),
  courseId: int('course_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  contentType: varchar('content_type', { length: 50 }).notNull(),
  videoUrl: varchar('video_url', { length: 500 }),
  pdfUrl: varchar('pdf_url', { length: 500 }),
  textContent: text('text_content'),
  duration: int('duration'),
  orderIndex: int('order_index').notNull().default(0),
  isFree: boolean('is_free').notNull().default(false),
  isPublished: boolean('is_published').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;

// ============================================
// LESSON PROGRESS TABLE
// ============================================
export const lessonProgress = mysqlTable('lesson_progress', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  lessonId: int('lesson_id').notNull(),
  courseId: int('course_id').notNull(),
  isCompleted: boolean('is_completed').notNull().default(false),
  progressPercentage: int('progress_percentage').notNull().default(0),
  lastPosition: int('last_position'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type LessonProgress = typeof lessonProgress.$inferSelect;
export type NewLessonProgress = typeof lessonProgress.$inferInsert;

// ============================================
// ENROLLMENTS TABLE
// ============================================
export const enrollments = mysqlTable('enrollments', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  courseId: int('course_id').notNull(),
  progress: int('progress').notNull().default(0),
  completedLessons: int('completed_lessons').notNull().default(0),
  lastAccessedAt: timestamp('last_accessed_at'),
  completedAt: timestamp('completed_at'),
  certificateUrl: varchar('certificate_url', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;

// ============================================
// TEST SUBJECTS TABLE
// ============================================
export const testSubjects = mysqlTable('test_subjects', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description'),
  thumbnail: varchar('thumbnail', { length: 500 }),
  isActive: boolean('is_active').notNull().default(true),
  orderIndex: int('order_index').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type TestSubject = typeof testSubjects.$inferSelect;
export type NewTestSubject = typeof testSubjects.$inferInsert;

// ============================================
// TEST CHAPTERS TABLE
// ============================================
export const testChapters = mysqlTable('test_chapters', {
  id: int('id').primaryKey().autoincrement(),
  subjectId: int('subject_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  orderIndex: int('order_index').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type TestChapter = typeof testChapters.$inferSelect;
export type NewTestChapter = typeof testChapters.$inferInsert;

// ============================================
// QUIZZES TABLE
// ============================================
export const quizzes = mysqlTable('quizzes', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  thumbnail: varchar('thumbnail', { length: 500 }),
  category: varchar('category', { length: 100 }).notNull(),
  difficulty: varchar('difficulty', { length: 50 }).notNull(),
  duration: int('duration').notNull(),
  total_marks: int('total_marks').notNull(),
  passing_marks: int('passing_marks').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull().default('0.00'),
  discount_price: decimal('discount_price', { precision: 10, scale: 2 }),
  isFree: boolean('is_free').notNull().default(false),
  freeQuestionsCount: int('free_questions_count').notNull().default(0),
  isFeatured: boolean('is_featured').notNull().default(false),
  instructor_id: int('instructor_id').notNull(),
  course_id: int('course_id'),
  subjectId: int('subject_id'),
  chapterId: int('chapter_id'),
  is_published: tinyint('is_published', { width: 1 }).notNull().default(0),
  is_scheduled: tinyint('is_scheduled', { width: 1 }).notNull().default(0),
  shuffle_questions: tinyint('shuffle_questions', { width: 1 }).notNull().default(1),
  show_results: tinyint('show_results', { width: 1 }).notNull().default(1),
  negativeMarking: boolean('negative_marking').notNull().default(false),
  negativeMarksPerQuestion: decimal('negative_marks_per_question', { precision: 3, scale: 2 }).default('0.00'),
  allowReview: boolean('allow_review').notNull().default(true),
  showAnswerKey: boolean('show_answer_key').notNull().default(true),
  certificateEligible: boolean('certificate_eligible').notNull().default(false),
  attemptsAllowed: int('attempts_allowed').default(1),
  start_time: datetime('start_time'),
  end_time: datetime('end_time'),
  results_declared: tinyint('results_declared', { width: 1 }).notNull().default(0),
  results_declaration_time: datetime('results_declaration_time'),
  total_attempts: int('total_attempts').notNull().default(0),
  total_students: int('total_students').notNull().default(0),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;

// ============================================
// QUESTIONS TABLE
// ============================================
export const questions = mysqlTable('questions', {
  id: int('id').primaryKey().autoincrement(),
  quizId: int('quiz_id').notNull(),
  questionType: varchar('question_type', { length: 50 }).notNull().default('mcq'),
  question: text('question').notNull(),
  questionImage: varchar('question_image', { length: 500 }),
  options: json('options').notNull(),
  correctAnswer: json('correct_answer').notNull(),
  explanation: text('explanation'),
  marks: int('marks').notNull().default(1),
  negativeMarks: decimal('negative_marks', { precision: 3, scale: 2 }).default('0.00'),
  difficulty: varchar('difficulty', { length: 50 }).default('medium'),
  orderIndex: int('order_index').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

// ============================================
// QUIZ ATTEMPTS TABLE
// ============================================
export const quiz_attempts = mysqlTable('quiz_attempts', {
  id: int('id').primaryKey().autoincrement(),
  user_id: int('user_id').notNull(),
  quiz_id: int('quiz_id').notNull(),
  score: int('score').notNull(),
  total_questions: int('total_questions').notNull(),
  correct_answers: int('correct_answers').notNull(),
  wrong_answers: int('wrong_answers').notNull(),
  skipped_answers: int('skipped_answers').notNull(),
  time_taken: int('time_taken').notNull(),
  answers: json('answers').notNull(),
  is_passed: tinyint('is_passed', { width: 1 }).notNull(),
  percentage: decimal('percentage', { precision: 5, scale: 2 }),
  status: varchar('status', { length: 50 }).notNull().default('submitted'),
  result_viewed: tinyint('result_viewed', { width: 1 }).notNull().default(0),
  rank: int('rank'),
  completed_at: timestamp('completed_at').notNull().defaultNow(),
});

export type QuizAttempt = typeof quiz_attempts.$inferSelect;
export type NewQuizAttempt = typeof quiz_attempts.$inferInsert;

// ============================================
// STUDY MATERIALS TABLE
// ============================================
export const studyMaterials = mysqlTable('study_materials', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  subject: varchar('subject', { length: 100 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  fileType: varchar('file_type', { length: 20 }).notNull(),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileSize: int('file_size'),
  totalPages: int('total_pages'),
  thumbnail: varchar('thumbnail', { length: 500 }),
  courseId: int('course_id'),
  isPaid: boolean('is_paid').notNull().default(false),
  price: decimal('price', { precision: 10, scale: 2 }),
  discountPrice: decimal('discount_price', { precision: 10, scale: 2 }),
  isPublished: boolean('is_published').notNull().default(true),
  downloads: int('downloads').notNull().default(0),
  views: int('views').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type StudyMaterial = typeof studyMaterials.$inferSelect;
export type NewStudyMaterial = typeof studyMaterials.$inferInsert;

// ============================================
// JOBS TABLE
// ============================================
export const jobs = mysqlTable('jobs', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 500 }).notNull(),
  organization: varchar('organization', { length: 255 }).notNull(),
  department: varchar('department', { length: 255 }),
  location: varchar('location', { length: 255 }),
  state: varchar('state', { length: 100 }),
  positions: int('positions'),
  qualifications: text('qualifications'),
  experience: varchar('experience', { length: 255 }),
  salary: varchar('salary', { length: 255 }),
  ageLimit: varchar('age_limit', { length: 100 }),
  applicationFee: varchar('application_fee', { length: 100 }),
  description: text('description'),
  responsibilities: json('responsibilities'),
  requirements: json('requirements'),
  benefits: json('benefits'),
  applyUrl: varchar('apply_url', { length: 500 }),
  lastDate: datetime('last_date', { mode: 'string' }),
  examDate: datetime('exam_date', { mode: 'string' }),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  views: int('views').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;

// ============================================
// CURRENT AFFAIRS TABLE
// ============================================
export const currentAffairs = mysqlTable('current_affairs', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 500 }).notNull(),
  summary: text('summary'),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  tags: json('tags'),
  thumbnail: varchar('thumbnail', { length: 500 }),
  source: varchar('source', { length: 255 }),
  sourceUrl: varchar('source_url', { length: 500 }),
  date: datetime('date', { mode: 'string' }).notNull(),
  importance: varchar('importance', { length: 50 }).default('medium'),
  views: int('views').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type CurrentAffair = typeof currentAffairs.$inferSelect;
export type NewCurrentAffair = typeof currentAffairs.$inferInsert;

// ============================================
// PAYMENTS TABLE
// ============================================
export const payments = mysqlTable('payments', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  courseId: int('course_id'),
  quizId: int('quiz_id'),
  studyMaterialId: int('study_material_id'),
  orderId: varchar('order_id', { length: 255 }).notNull(),
  transactionId: varchar('transaction_id', { length: 255 }).notNull(),
  paymentId: varchar('payment_id', { length: 255 }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('INR'),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  method: varchar('method', { length: 50 }),
  signature: varchar('signature', { length: 500 }),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

// ============================================
// QUIZ ACCESS TABLE
// ============================================
export const quiz_access = mysqlTable('quiz_access', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('userId').notNull(),
  quizId: int('quizId').notNull(),
  accessGrantedAt: timestamp('accessGrantedAt').defaultNow(),
  accessExpiresAt: timestamp('accessExpiresAt'),
  isLifetimeAccess: boolean('isLifetimeAccess').default(false),
  isAccessExpired: boolean('isAccessExpired').default(false),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow(),
});

export type QuizAccess = typeof quiz_access.$inferSelect;
export type NewQuizAccess = typeof quiz_access.$inferInsert;

// ============================================
// COUPONS TABLE
// ============================================
export const coupons = mysqlTable('coupons', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  description: varchar('description', { length: 500 }),
  discountType: varchar('discount_type', { length: 20 }).notNull(),
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  minAmount: decimal('min_amount', { precision: 10, scale: 2 }),
  maxDiscount: decimal('max_discount', { precision: 10, scale: 2 }),
  usageLimit: int('usage_limit'),
  usedCount: int('used_count').notNull().default(0),
  validFrom: datetime('valid_from', { mode: 'string' }).notNull(),
  validUntil: datetime('valid_until', { mode: 'string' }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;

// ============================================
// COURSE FILES TABLE
// ============================================
export const courseFiles = mysqlTable('course_files', {
  id: int('id').primaryKey().autoincrement(),
  courseId: int('course_id').notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileType: varchar('file_type', { length: 50 }).notNull(),
  fileSize: int('file_size'),
  uploadedBy: int('uploaded_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type CourseFile = typeof courseFiles.$inferSelect;
export type NewCourseFile = typeof courseFiles.$inferInsert;

// ============================================
// NOTIFICATIONS TABLE
// ============================================
export const notifications = mysqlTable('notifications', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  link: varchar('link', { length: 500 }),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// ============================================
// SITE SETTINGS TABLE
// ============================================
export const siteSettings = mysqlTable('site_settings', {
  id: int('id').primaryKey().autoincrement(),
  siteName: varchar('site_name', { length: 255 }).notNull().default('Unchi Udaan'),
  logo: varchar('logo', { length: 500 }),
  favicon: varchar('favicon', { length: 500 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 50 }),
  contactAddress: text('contact_address'),
  facebookUrl: varchar('facebook_url', { length: 500 }),
  instagramUrl: varchar('instagram_url', { length: 500 }),
  linkedinUrl: varchar('linkedin_url', { length: 500 }),
  whatsappNumber: varchar('whatsapp_number', { length: 50 }),
  telegramUrl: varchar('telegram_url', { length: 500 }),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  metaKeywords: text('meta_keywords'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;

// ============================================
// FEEDBACKS TABLE
// ============================================
export const feedbacks = mysqlTable('feedbacks', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull().default('Anonymous'),
  email: varchar('email', { length: 255 }),
  message: text('message').notNull(),
  rating: int('rating').notNull().default(5),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  userId: int('user_id'),
  isPublic: boolean('is_public').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type Feedback = typeof feedbacks.$inferSelect;
export type NewFeedback = typeof feedbacks.$inferInsert;

// ============================================
// TESTIMONIALS TABLE
// ============================================
export const testimonials = mysqlTable('testimonials', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 255 }).notNull(),
  avatar: varchar('avatar', { length: 10 }),
  content: text('content').notNull(),
  rating: int('rating').notNull().default(5),
  isActive: boolean('is_active').notNull().default(true),
  displayOrder: int('display_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;

// ============================================
// STUDY MATERIAL PURCHASES TABLE
// ============================================
export const studyMaterialPurchases = mysqlTable('study_material_purchases', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  studyMaterialId: int('study_material_id').notNull(),
  paymentId: int('payment_id').notNull(),
  purchasePrice: decimal('purchase_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type StudyMaterialPurchase = typeof studyMaterialPurchases.$inferSelect;
export type NewStudyMaterialPurchase = typeof studyMaterialPurchases.$inferInsert;

// ============================================
// CERTIFICATE TEMPLATES TABLE
// ============================================
export const certificateTemplates = mysqlTable('certificate_templates', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  backgroundImage: varchar('background_image', { length: 500 }),
  fields: json('fields').notNull(), // Array of { type, x, y, fontSize, fontColor, fontFamily, width, height }
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type CertificateTemplate = typeof certificateTemplates.$inferSelect;
export type NewCertificateTemplate = typeof certificateTemplates.$inferInsert;

// ============================================
// CERTIFICATES TABLE
// ============================================
export const certificates = mysqlTable('certificates', {
  id: int('id').primaryKey().autoincrement(),
  certificateId: varchar('certificate_id', { length: 50 }).notNull().unique(),
  userId: int('user_id').notNull(),
  templateId: int('template_id'),
  type: varchar('type', { length: 20 }).notNull(), // 'course' | 'quiz'
  courseId: int('course_id'),
  quizId: int('quiz_id'),
  attemptId: int('attempt_id'),
  userName: varchar('user_name', { length: 255 }).notNull(),
  itemName: varchar('item_name', { length: 500 }).notNull(),
  achievementText: text('achievement_text'),
  completionDate: datetime('completion_date', { mode: 'string' }).notNull(),
  pdfUrl: varchar('pdf_url', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Certificate = typeof certificates.$inferSelect;
export type NewCertificate = typeof certificates.$inferInsert;

// ============================================
// MOBILE APP SETTINGS TABLE
// ============================================
export const mobileAppSettings = mysqlTable('mobile_app_settings', {
  id: int('id').primaryKey().autoincrement(),

  // General App Config
  appName: varchar('app_name', { length: 255 }).notNull().default('Unchi Udaan'),
  appVersion: varchar('app_version', { length: 50 }).notNull().default('1.0.0'),
  minAppVersion: varchar('min_app_version', { length: 50 }).notNull().default('1.0.0'),
  maintenanceMode: boolean('maintenance_mode').notNull().default(false),
  maintenanceMessage: text('maintenance_message'),
  forceUpdate: boolean('force_update').notNull().default(false),
  updateUrl: varchar('update_url', { length: 500 }),

  // Push Notifications
  notificationsEnabled: boolean('notifications_enabled').notNull().default(true),
  notificationTitle: varchar('notification_title', { length: 255 }),
  notificationBody: text('notification_body'),
  notificationImageUrl: varchar('notification_image_url', { length: 500 }),
  notificationTargetScreen: varchar('notification_target_screen', { length: 100 }),

  // Home Banner / Carousel
  bannersEnabled: boolean('banners_enabled').notNull().default(true),
  banners: json('banners'), // Array of { imageUrl, title, linkUrl, isActive, order }

  // Advertisements
  adsEnabled: boolean('ads_enabled').notNull().default(false),
  adBannerImageUrl: varchar('ad_banner_image_url', { length: 500 }),
  adBannerLinkUrl: varchar('ad_banner_link_url', { length: 500 }),
  adInterstitialEnabled: boolean('ad_interstitial_enabled').notNull().default(false),
  adFrequency: int('ad_frequency').notNull().default(5), // show ad every N screens

  // Content Visibility
  showCourses: boolean('show_courses').notNull().default(true),
  showQuizzes: boolean('show_quizzes').notNull().default(true),
  showJobs: boolean('show_jobs').notNull().default(true),
  showCurrentAffairs: boolean('show_current_affairs').notNull().default(true),
  showStudyMaterials: boolean('show_study_materials').notNull().default(true),
  showLiveClasses: boolean('show_live_classes').notNull().default(false),

  // Popup / Announcement
  popupEnabled: boolean('popup_enabled').notNull().default(false),
  popupTitle: varchar('popup_title', { length: 255 }),
  popupMessage: text('popup_message'),
  popupImageUrl: varchar('popup_image_url', { length: 500 }),
  popupActionUrl: varchar('popup_action_url', { length: 500 }),
  popupActionLabel: varchar('popup_action_label', { length: 100 }),

  // Support
  supportWhatsapp: varchar('support_whatsapp', { length: 50 }),
  supportEmail: varchar('support_email', { length: 255 }),
  supportPhone: varchar('support_phone', { length: 50 }),

  // API Config
  apiBaseUrl: varchar('api_base_url', { length: 500 }),
  apiDocsUrl: varchar('api_docs_url', { length: 500 }),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type MobileAppSetting = typeof mobileAppSettings.$inferSelect;
export type NewMobileAppSetting = typeof mobileAppSettings.$inferInsert;
