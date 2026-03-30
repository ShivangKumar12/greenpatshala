// server/routes/adminQuizRoutes.ts
import express from 'express';
import {
  getAdminQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  togglePublish,
  toggleFree,
  updateQuizPricing,
  addQuestions,
  updateQuestion,
  deleteQuestion,
  getQuizStatistics,
  getQuizResults,
  exportQuizQuestions,
  exportQuizResultsPDF,
  toggleFeatured,
} from '../controllers/adminQuizController';
import { authenticate, isAdmin } from '../middleware/auth'; // ✅ FIXED IMPORT

const router = express.Router();

// ============================================
// MIDDLEWARE - Apply to all routes
// ============================================
router.use(authenticate);
router.use(isAdmin); // ✅ FIXED MIDDLEWARE

// ============================================
// QUIZ CRUD ROUTES
// ============================================

// GET /api/admin/quizzes - List all quizzes with filters/pagination
router.get('/', getAdminQuizzes);

// GET /api/admin/quizzes/:id - Get single quiz by ID (with questions)
router.get('/:id', getQuizById);

// POST /api/admin/quizzes - Create new quiz
router.post('/', createQuiz);

// PUT /api/admin/quizzes/:id - Update existing quiz
router.put('/:id', updateQuiz);

// DELETE /api/admin/quizzes/:id - Delete quiz (cascades to questions & attempts)
router.delete('/:id', deleteQuiz);

// ============================================
// QUIZ STATUS TOGGLE ROUTES
// ============================================

// PATCH /api/admin/quizzes/:id/toggle-publish - Toggle publish status
router.patch('/:id/toggle-publish', togglePublish);

// PATCH /api/admin/quizzes/:id/toggle-free - Toggle free/paid status
router.patch('/:id/toggle-free', toggleFree);

// PATCH /api/admin/quizzes/:id/toggle-featured - Toggle featured status
router.patch('/:id/toggle-featured', toggleFeatured);

// ============================================
// PRICING ROUTE
// ============================================

// PATCH /api/admin/quizzes/:id/pricing - Update pricing
// Body: { price: 999, discount_price: 799, isFree: false }
router.patch('/:id/pricing', updateQuizPricing);

// ============================================
// QUESTION MANAGEMENT ROUTES
// ============================================

// POST /api/admin/quizzes/:id/questions - Add questions (bulk)
// Body: { questions: [{ question, options, correctAnswer, marks, ... }] }
router.post('/:id/questions', addQuestions);

// PUT /api/admin/quizzes/:id/questions/:questionId - Update question
router.put('/:id/questions/:questionId', updateQuestion);

// DELETE /api/admin/quizzes/:id/questions/:questionId - Delete question
router.delete('/:id/questions/:questionId', deleteQuestion);

// ============================================
// STATISTICS & RESULTS ROUTES
// ============================================

// GET /api/admin/quizzes/:id/statistics - Get quiz statistics
router.get('/:id/statistics', getQuizStatistics);

// GET /api/admin/quizzes/:id/results - Get all quiz results/attempts
router.get('/:id/results', getQuizResults);

// ============================================
// PDF EXPORT ROUTES
// ============================================

// GET /api/admin/quizzes/:id/export/questions - Export quiz questions to PDF
router.get('/:id/export/questions', exportQuizQuestions);

// GET /api/admin/quizzes/:id/export/results - Export all results to PDF
router.get('/:id/export/results', exportQuizResultsPDF);

export default router;
