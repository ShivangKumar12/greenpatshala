// server/controllers/quizController.ts
import { Request, Response } from 'express';
import { db } from '../config/db';
import { quizzes, questions, quiz_attempts, quiz_access } from '../../shared/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';


// Helper function to check quiz accessibility
const isQuizAccessible = (quiz: any): { accessible: boolean; reason?: string } => {
  const now = new Date();

  if (!quiz.is_published) {
    return { accessible: false, reason: 'Quiz is not published yet' };
  }

  if (quiz.is_scheduled) {
    if (quiz.start_time && new Date(quiz.start_time) > now) {
      return { accessible: false, reason: 'Quiz has not started yet' };
    }
    if (quiz.end_time && new Date(quiz.end_time) < now) {
      return { accessible: false, reason: 'Quiz has ended' };
    }
  }

  return { accessible: true };
};


// Helper function to safely parse JSON options
const parseQuestionOptions = (options: any): string[] => {
  if (Array.isArray(options)) return options;
  if (typeof options === 'string') {
    try {
      return JSON.parse(options);
    } catch {
      return [];
    }
  }
  return [];
};


// ============================================
// GET ALL QUIZZES (Authenticated - checks purchase access)
// ============================================
export const getAllQuizzes = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { category, difficulty, courseId } = req.query;
    const userId = (req as any).userId || null;

    const conditions: any[] = [eq(quizzes.is_published, 1)];

    if (category) conditions.push(eq(quizzes.category, category as string));
    if (difficulty) conditions.push(eq(quizzes.difficulty, difficulty as string));
    if (courseId) conditions.push(eq(quizzes.course_id, Number(courseId)));

    // Base quiz data
    const baseQuizzes = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        description: quizzes.description,
        category: quizzes.category,
        difficulty: quizzes.difficulty,
        duration: quizzes.duration,
        total_marks: quizzes.total_marks,
        passing_marks: quizzes.passing_marks,
        price: quizzes.price,
        discount_price: quizzes.discount_price,
        freeQuestionsCount: quizzes.freeQuestionsCount, // ✅ NEW
        is_published: quizzes.is_published,
        is_scheduled: quizzes.is_scheduled,
        start_time: quizzes.start_time,
        end_time: quizzes.end_time,
        total_attempts: quizzes.total_attempts,
        created_at: quizzes.created_at,
      })
      .from(quizzes)
      .where(and(...conditions))
      .orderBy(desc(quizzes.created_at));

    if (baseQuizzes.length === 0) {
      return res.json({ success: true, count: 0, quizzes: [] });
    }

    const quizIds = baseQuizzes.map((q) => q.id);

    // Get question counts
    const questionCounts = await db
      .select({
        quizId: questions.quizId,
        count: sql<number>`count(*)`,
      })
      .from(questions)
      .where(inArray(questions.quizId, quizIds))
      .groupBy(questions.quizId);

    const questionCountMap = new Map<number, number>();
    questionCounts.forEach((row) => {
      questionCountMap.set(row.quizId, row.count);
    });

    // Get quiz access for logged-in user
    let accessMap = new Map<number, boolean>();
    if (userId) {
      const accessRows = await db
        .select({
          quizId: quiz_access.quizId,
        })
        .from(quiz_access)
        .where(eq(quiz_access.userId, userId));

      accessRows.forEach((row) => {
        accessMap.set(row.quizId, true);
      });
    }

    const quizzesWithStatus = baseQuizzes.map((quiz) => {
      const { accessible, reason } = isQuizAccessible(quiz);
      const totalQuestions = questionCountMap.get(quiz.id) || 0;

      const priceNumber = parseFloat(quiz.price ?? "0");
      const isFree = !priceNumber || priceNumber === 0;

      // User has access if quiz is free OR they purchased it
      const userHasAccess = accessMap.get(quiz.id) === true;
      const has_access = isFree || userHasAccess;

      return {
        ...quiz,
        accessible,
        accessibilityReason: reason || null,
        total_questions: totalQuestions,
        has_access,
      };
    });

    return res.json({
      success: true,
      count: quizzesWithStatus.length,
      quizzes: quizzesWithStatus,
    });
  } catch (error: any) {
    console.error("[GET ALL QUIZZES ERROR]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quizzes",
    });
  }
};


// ============================================
// GET QUIZ BY ID (Public - For Payment/Details Page)
// ✅ FIXED: No purchase check - allows viewing quiz details before buying
// ============================================
export const getQuizById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const quizId = Number(req.params.id);

    if (isNaN(quizId)) {
      return res.status(400).json({ success: false, message: 'Invalid quiz ID' });
    }

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const { accessible, reason } = isQuizAccessible(quiz);
    if (!accessible) {
      return res.status(403).json({ success: false, message: reason });
    }

    // ✅ NO PURCHASE CHECK HERE - This endpoint is for viewing quiz details

    // Get question count (but NOT the questions themselves)
    const [questionCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions)
      .where(eq(questions.quizId, quizId));

    // ✅ Return basic quiz info WITHOUT questions
    return res.json({
      success: true,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        duration: quiz.duration,
        total_marks: quiz.total_marks,
        passing_marks: quiz.passing_marks,
        price: quiz.price,
        discount_price: quiz.discount_price,
        freeQuestionsCount: quiz.freeQuestionsCount, // ✅ NEW
        shuffle_questions: quiz.shuffle_questions,
        show_results: quiz.show_results,
        start_time: quiz.start_time,
        end_time: quiz.end_time,
        results_declared: quiz.results_declared,
        is_published: quiz.is_published,
        is_scheduled: quiz.is_scheduled,
        total_attempts: quiz.total_attempts,
        created_at: quiz.created_at,
        total_questions: Number(questionCount?.count || 0),
        // ❌ NO QUESTIONS - those require purchase/access
      },
    });
  } catch (error: any) {
    console.error('[GET QUIZ BY ID ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz'
    });
  }
};


// ============================================
// GET QUIZ FOR ATTEMPT (Protected - Supports Free Preview + Multiple Attempts)
// ✅ FIXED: Respects attemptsAllowed setting
// ============================================
export const getQuizForAttempt = async (req: Request, res: Response): Promise<Response> => {
  try {
    const quizId = Number(req.params.id);
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (isNaN(quizId)) {
      return res.status(400).json({ success: false, message: 'Invalid quiz ID' });
    }

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const { accessible, reason } = isQuizAccessible(quiz);
    if (!accessible) {
      return res.status(403).json({ success: false, message: reason });
    }

    // ✅ CHECK HOW MANY ATTEMPTS USER HAS MADE
    const userAttempts = await db
      .select()
      .from(quiz_attempts)
      .where(and(
        eq(quiz_attempts.user_id, userId),
        eq(quiz_attempts.quiz_id, quizId)
      ))
      .orderBy(desc(quiz_attempts.completed_at));

    const attemptCount = userAttempts.length;
    const attemptsAllowed = quiz.attemptsAllowed || 1; // Default to 1 if not set

    // ✅ BLOCK ONLY IF ATTEMPTS EXHAUSTED
    if (attemptCount >= attemptsAllowed) {
      const latestAttempt = userAttempts[0];

      return res.json({
        success: true,
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
        },
        previousAttempt: {
          id: latestAttempt.id,
          score: latestAttempt.score,
          percentage: latestAttempt.percentage,
          is_passed: latestAttempt.is_passed,
          completed_at: latestAttempt.completed_at,
          attemptNumber: attemptCount,
          attemptsAllowed: attemptsAllowed,
        },
        message: `You have used all ${attemptsAllowed} attempt(s) for this quiz. Please wait for next attempt or try another quiz.`,
      });
    }

    // ✅ CHECK IF QUIZ IS FREE
    const priceNumber = parseFloat(quiz.price ?? "0");
    const isFreeQuiz = priceNumber === 0;

    // ✅ CHECK IF USER HAS PURCHASED ACCESS
    let hasPurchasedAccess = false;
    if (!isFreeQuiz) {
      const [accessRecord] = await db
        .select()
        .from(quiz_access)
        .where(and(
          eq(quiz_access.userId, userId),
          eq(quiz_access.quizId, quizId)
        ))
        .limit(1);

      hasPurchasedAccess = !!accessRecord;
    }

    // ✅ CHECK FREE QUESTIONS PREVIEW LIMIT
    const freeQuestionsCount = quiz.freeQuestionsCount || 0;

    // Get all questions
    const quizQuestions = await db
      .select({
        id: questions.id,
        question: questions.question,
        options: questions.options,
        marks: questions.marks,
        orderIndex: questions.orderIndex,
      })
      .from(questions)
      .where(eq(questions.quizId, quizId))
      .orderBy(questions.orderIndex);

    // Parse options from JSON string to array
    const parsedQuestions = quizQuestions.map(q => ({
      id: q.id,
      question: q.question,
      options: parseQuestionOptions(q.options),
      marks: q.marks,
    }));

    // Shuffle if enabled
    const finalQuestions = quiz.shuffle_questions
      ? parsedQuestions.sort(() => Math.random() - 0.5)
      : parsedQuestions;

    // ✅ DETERMINE WHAT QUESTIONS TO RETURN
    let questionsToReturn = finalQuestions;
    let requiresPayment = false;
    let paymentAfterQuestion = 0;

    if (isFreeQuiz || hasPurchasedAccess) {
      // User has full access - return all questions
      questionsToReturn = finalQuestions;
      requiresPayment = false;
      paymentAfterQuestion = 0;
    } else {
      // Paid quiz without access
      if (freeQuestionsCount > 0) {
        // Has preview questions - return all but mark payment gate
        questionsToReturn = finalQuestions;
        requiresPayment = true;
        paymentAfterQuestion = freeQuestionsCount;
      } else {
        // No preview - payment required immediately
        questionsToReturn = finalQuestions;
        requiresPayment = true;
        paymentAfterQuestion = 0;
      }
    }

    return res.json({
      success: true,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        duration: quiz.duration,
        total_marks: quiz.total_marks,
        passing_marks: quiz.passing_marks,
        price: quiz.price,
        discount_price: quiz.discount_price,
        shuffle_questions: quiz.shuffle_questions,
        show_results: quiz.show_results,
        start_time: quiz.start_time,
        end_time: quiz.end_time,
        results_declared: quiz.results_declared,
        attemptsAllowed: attemptsAllowed,
        attemptsUsed: attemptCount, // ✅ Show how many attempts used
        attemptsRemaining: attemptsAllowed - attemptCount, // ✅ Show remaining
        questions: questionsToReturn,

        // ✅ PAYMENT GATE INFO
        totalQuestions: finalQuestions.length,
        freeQuestionsCount: freeQuestionsCount,
        hasPurchasedAccess: hasPurchasedAccess || isFreeQuiz,
        requiresPayment: requiresPayment,
        paymentAfterQuestion: paymentAfterQuestion,
        paymentMessage: requiresPayment
          ? (paymentAfterQuestion > 0
            ? `You can preview the first ${paymentAfterQuestion} questions. Purchase to access all ${finalQuestions.length} questions.`
            : `Purchase this quiz to access all ${finalQuestions.length} questions.`)
          : null,
      },
      previousAttempt: null, // ✅ null = can attempt
    });
  } catch (error: any) {
    console.error('[GET QUIZ FOR ATTEMPT ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz'
    });
  }
};




// ============================================
// CREATE QUIZ (Instructor/Admin)
// ============================================
export const createQuiz = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;

    if (!['instructor', 'admin'].includes(user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only instructors and admins can create quizzes'
      });
    }

    const {
      title, description, category, difficulty, duration, total_marks, passing_marks,
      price, discount_price, freeQuestionsCount, course_id, shuffle_questions, show_results, is_scheduled, start_time, end_time,
    } = req.body;

    // Validation
    if (!title || !category || !difficulty || !duration || !total_marks || !passing_marks) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (is_scheduled && !start_time) {
      return res.status(400).json({
        success: false,
        message: 'Start time is required for scheduled quizzes'
      });
    }

    if (end_time && start_time && new Date(start_time) >= new Date(end_time)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const [result] = await db.insert(quizzes).values({
      title,
      description: description || null,
      category,
      difficulty,
      duration,
      total_marks,
      passing_marks,
      price: price || '0.00',
      discount_price: discount_price || null,
      freeQuestionsCount: freeQuestionsCount || 0, // ✅ NEW
      instructor_id: userId,
      course_id: course_id || null,
      shuffle_questions: shuffle_questions !== undefined ? shuffle_questions : 1,
      show_results: show_results !== undefined ? show_results : 1,
      is_published: 0,
      is_scheduled: is_scheduled || 0,
      start_time: start_time || null,
      end_time: end_time || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quizId: result.insertId
    });
  } catch (error: any) {
    console.error('[CREATE QUIZ ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create quiz'
    });
  }
};


// ============================================
// UPDATE QUIZ (Instructor/Admin)
// ============================================
export const updateQuiz = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;
    const quizId = Number(req.params.id);

    if (!['instructor', 'admin'].includes(user?.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (user.role !== 'admin' && quiz.instructor_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own quizzes'
      });
    }

    const updateData: any = { ...req.body };
    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.instructor_id;
    delete updateData.created_at;
    delete updateData.total_attempts;

    // Validate scheduled quiz times
    if (updateData.is_scheduled && updateData.start_time && updateData.end_time) {
      if (new Date(updateData.start_time) >= new Date(updateData.end_time)) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }
    }

    await db.update(quizzes).set(updateData).where(eq(quizzes.id, quizId));

    return res.json({ success: true, message: 'Quiz updated successfully' });
  } catch (error: any) {
    console.error('[UPDATE QUIZ ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update quiz'
    });
  }
};


// ============================================
// TOGGLE PUBLISH QUIZ (Instructor/Admin)
// ============================================
export const togglePublishQuiz = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;
    const quizId = Number(req.params.id);
    const { is_published } = req.body;

    if (!['instructor', 'admin'].includes(user?.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (user.role !== 'admin' && quiz.instructor_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only publish your own quizzes'
      });
    }

    // Prevent publishing quiz without questions
    if (is_published) {
      const quizQuestions = await db.select().from(questions).where(eq(questions.quizId, quizId));
      if (quizQuestions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot publish quiz without questions'
        });
      }
    }

    await db.update(quizzes)
      .set({ is_published: is_published ? 1 : 0 })
      .where(eq(quizzes.id, quizId));

    return res.json({
      success: true,
      message: is_published ? 'Quiz published successfully' : 'Quiz unpublished successfully'
    });
  } catch (error: any) {
    console.error('[TOGGLE PUBLISH QUIZ ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update quiz status'
    });
  }
};


// ============================================
// DECLARE RESULTS (Instructor/Admin)
// ============================================
export const declareResults = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;
    const quizId = Number(req.params.id);

    if (!['instructor', 'admin'].includes(user?.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (user.role !== 'admin' && quiz.instructor_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Declare results
    await db.update(quizzes).set({
      results_declared: 1,
      results_declaration_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
    }).where(eq(quizzes.id, quizId));

    // Update all attempts status
    await db.update(quiz_attempts)
      .set({ status: 'evaluated' })
      .where(eq(quiz_attempts.quiz_id, quizId));

    return res.json({ success: true, message: 'Results declared successfully' });
  } catch (error: any) {
    console.error('[DECLARE RESULTS ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to declare results'
    });
  }
};


// ============================================
// DELETE QUIZ (Instructor/Admin)
// ============================================
export const deleteQuiz = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;
    const quizId = Number(req.params.id);

    if (!['instructor', 'admin'].includes(user?.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (user.role !== 'admin' && quiz.instructor_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own quizzes'
      });
    }

    // Delete related data first (foreign keys)
    await db.delete(questions).where(eq(questions.quizId, quizId));
    await db.delete(quiz_attempts).where(eq(quiz_attempts.quiz_id, quizId));
    await db.delete(quizzes).where(eq(quizzes.id, quizId));

    return res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error: any) {
    console.error('[DELETE QUIZ ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete quiz'
    });
  }
};


// ============================================
// GET MY QUIZZES (Student - My enrolled quizzes)
// ============================================
export const getMyQuizzes = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Get quizzes the user has access to with their attempt stats
    const myQuizzes = await db
      .select({
        id: quiz_access.id,
        quiz_id: quizzes.id,
        title: quizzes.title,
        thumbnail: quizzes.thumbnail,
        category: quizzes.category,
        difficulty: quizzes.difficulty,
      })
      .from(quiz_access)
      .innerJoin(quizzes, eq(quiz_access.quizId, quizzes.id))
      .where(eq(quiz_access.userId, userId))
      .orderBy(desc(quiz_access.createdAt));

    // Get attempt stats for each quiz
    const quizzesWithStats = await Promise.all(
      myQuizzes.map(async (quiz) => {
        const attempts = await db
          .select({
            total: sql<number>`COUNT(*)`,
            best_score: sql<number>`MAX(${quiz_attempts.score})`,
            is_passed: sql<number>`MAX(${quiz_attempts.is_passed})`,
            last_attempt: sql<string>`MAX(${quiz_attempts.completed_at})`,
          })
          .from(quiz_attempts)
          .where(
            and(
              eq(quiz_attempts.quiz_id, quiz.quiz_id),
              eq(quiz_attempts.user_id, userId)
            )
          );

        return {
          ...quiz,
          total_attempts: attempts[0]?.total || 0,
          best_score: attempts[0]?.best_score || null,
          is_passed: attempts[0]?.is_passed === 1,
          last_attempt_date: attempts[0]?.last_attempt || null,
        };
      })
    );

    return res.json({
      success: true,
      quizzes: quizzesWithStats,
    });
  } catch (error: any) {
    console.error('[GET MY QUIZZES ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your quizzes',
    });
  }
};


// ============================================
// GET INSTRUCTOR QUIZZES (Instructor/Admin)
// ============================================
export const getInstructorQuizzes = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;

    if (!['instructor', 'admin'].includes(user?.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const instructorQuizzes = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.instructor_id, userId))
      .orderBy(desc(quizzes.created_at));

    // Add question count for each quiz
    const quizzesWithDetails = await Promise.all(
      instructorQuizzes.map(async (quiz) => {
        const [questionCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(questions)
          .where(eq(questions.quizId, quiz.id));

        return {
          ...quiz,
          questionCount: questionCount?.count || 0
        };
      })
    );

    return res.json({
      success: true,
      count: quizzesWithDetails.length,
      quizzes: quizzesWithDetails
    });
  } catch (error: any) {
    console.error('[GET INSTRUCTOR QUIZZES ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes'
    });
  }
};
