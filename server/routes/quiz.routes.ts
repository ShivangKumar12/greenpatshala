// server/routes/quiz.routes.ts
import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import * as QuizCtrl from '../controllers/quizController';
import * as QuestionCtrl from '../controllers/questionController';
import * as AttemptCtrl from '../controllers/quizAttemptController';
import { cacheResponse } from '../middleware/cacheMiddleware';

const router = Router();

// ============================================
// INSTRUCTOR ROUTES (specific routes first)
// ============================================
router.get('/quizzes/instructor/my-quizzes', authenticate, QuizCtrl.getInstructorQuizzes);

// ============================================
// PUBLIC QUIZ ROUTES (No authentication)
// ============================================
// ✅ PUBLIC - View all quizzes (listing page) — cached 120s
router.get('/quizzes', optionalAuth, cacheResponse(120), QuizCtrl.getAllQuizzes);
router.get('/quizzes/my-quizzes', authenticate, QuizCtrl.getMyQuizzes);


// ✅ PUBLIC - View quiz details (payment page) — cached 120s
router.get('/quizzes/:id', cacheResponse(120), QuizCtrl.getQuizById);

// ============================================
// PROTECTED QUIZ ROUTES (Authentication required)
// ============================================
// ✅ NEW - Get quiz for attempt (requires purchase for paid quizzes)
router.get('/quizzes/:id/attempt', authenticate, QuizCtrl.getQuizForAttempt);

// Quiz CRUD operations
router.post('/quizzes', authenticate, QuizCtrl.createQuiz);
router.put('/quizzes/:id', authenticate, QuizCtrl.updateQuiz);
router.patch('/quizzes/:id/publish', authenticate, QuizCtrl.togglePublishQuiz);
router.patch('/quizzes/:id/results', authenticate, QuizCtrl.declareResults);
router.delete('/quizzes/:id', authenticate, QuizCtrl.deleteQuiz);

// ============================================
// QUESTION ROUTES (All protected)
// ============================================
router.get('/quizzes/:quizId/questions', authenticate, QuestionCtrl.getQuestionsByQuizId);
router.post('/quizzes/:quizId/questions', authenticate, QuestionCtrl.addQuestion);
router.post('/quizzes/:quizId/questions/bulk', authenticate, QuestionCtrl.addBulkQuestions);
router.get('/questions/:id', authenticate, QuestionCtrl.getQuestionById);
router.put('/questions/:id', authenticate, QuestionCtrl.updateQuestion);
router.delete('/questions/:id', authenticate, QuestionCtrl.deleteQuestion);

// ============================================
// QUIZ ATTEMPT ROUTES (All protected)
// ============================================
router.post('/quizzes/:quizId/submit', authenticate, AttemptCtrl.submitQuizAttempt);
router.get('/users/my-attempts', authenticate, AttemptCtrl.getUserAttempts);
router.get('/quiz-attempts/:attemptId', authenticate, AttemptCtrl.getQuizAttemptById);
router.get('/quizzes/:quizId/attempts', authenticate, AttemptCtrl.getQuizAttempts);
router.get('/quizzes/:quizId/statistics', authenticate, AttemptCtrl.getQuizStatistics);

export default router;
