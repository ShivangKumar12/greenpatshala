// server/controllers/adminQuizController.ts
import { Request, Response } from 'express';
import { invalidateCache } from '../middleware/cacheMiddleware';
import { db } from '../db';
import { quizzes, questions, quiz_attempts, users } from '../../shared/schema';
import { eq, desc, sql, and, or, like, inArray } from 'drizzle-orm';
import {
  exportQuizQuestionsToPDF,
  exportQuizResultsToPDF,
} from '../utils/pdfExport';


// ============================================
// GET ALL QUIZZES (with filters & pagination)
// ============================================
export const getAdminQuizzes = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      category = '',
      difficulty = '',
      status = '',
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE conditions
    const conditions: any[] = [];

    if (search) {
      conditions.push(
        or(
          like(quizzes.title, `%${search}%`),
          like(quizzes.description, `%${search}%`)
        )
      );
    }

    if (category) {
      conditions.push(eq(quizzes.category, category as string));
    }

    if (difficulty) {
      conditions.push(eq(quizzes.difficulty, difficulty as string));
    }

    if (status === 'published') {
      conditions.push(eq(quizzes.is_published, 1));
    } else if (status === 'draft') {
      conditions.push(eq(quizzes.is_published, 0));
    } else if (status === 'scheduled') {
      conditions.push(eq(quizzes.is_scheduled, 1));
    }

    // Get total count
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(quizzes)
      .where(whereClause);

    const total = Number(countResult.count);

    // Get quizzes
    let query = db.select().from(quizzes).where(whereClause);

    // Sorting
    const validSortFields = ['created_at', 'title', 'total_attempts', 'duration', 'price'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy as string : 'created_at';
    const orderColumn = quizzes[sortField as keyof typeof quizzes];

    query = sortOrder === 'asc'
      ? query.orderBy(orderColumn) as any
      : query.orderBy(desc(orderColumn)) as any;

    // Pagination
    const allQuizzes = await query.limit(limitNum).offset(offset);

    // Get question counts for each quiz
    const quizIds = allQuizzes.map((q) => q.id);
    let questionCounts: Record<number, number> = {};

    if (quizIds.length > 0) {
      const counts = await db
        .select({
          quizId: questions.quizId,
          count: sql<number>`count(*)`,
        })
        .from(questions)
        .where(inArray(questions.quizId, quizIds))
        .groupBy(questions.quizId);

      questionCounts = counts.reduce((acc, curr) => {
        acc[curr.quizId] = Number(curr.count);
        return acc;
      }, {} as Record<number, number>);
    }

    const quizzesWithCounts = allQuizzes.map((quiz) => ({
      ...quiz,
      questionCount: questionCounts[quiz.id] || 0,
    }));

    res.json({
      success: true,
      quizzes: quizzesWithCounts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('[GET ADMIN QUIZZES ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};


// ============================================
// GET SINGLE QUIZ BY ID (with questions)
// ============================================
export const getQuizById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quizId = parseInt(id);

    if (isNaN(quizId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID',
      });
    }

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Get all questions for this quiz
    const quizQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, quizId))
      .orderBy(questions.orderIndex);

    // Parse JSON fields
    const parsedQuestions = quizQuestions.map((q) => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      correctAnswer: typeof q.correctAnswer === 'string' ? JSON.parse(q.correctAnswer) : q.correctAnswer,
    }));

    res.json({
      success: true,
      quiz: {
        ...quiz,
        questions: parsedQuestions,
      },
    });
  } catch (error: any) {
    console.error('[GET QUIZ BY ID ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};


// ============================================
// CREATE NEW QUIZ - ✅ FIXED: Added freeQuestionsCount
// ============================================
export const createQuiz = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      thumbnail,
      category,
      difficulty,
      duration,
      total_marks,
      passing_marks,
      price,
      discount_price,
      isFree,
      freeQuestionsCount, // ✅ ADDED
      course_id,
      subjectId, // ✅ ADDED for test system
      chapterId, // ✅ ADDED for test system
      is_scheduled,
      start_time,
      end_time,
      shuffle_questions,
      show_results,
      negativeMarking,
      negativeMarksPerQuestion,
      allowReview,
      showAnswerKey,
      certificateEligible,
      attemptsAllowed,
    } = req.body;

    // Validation
    if (!title || !category || !difficulty || !duration || !total_marks || !passing_marks) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, category, difficulty, duration, total_marks, passing_marks',
      });
    }

    // Validate numeric fields
    const durationNum = parseInt(duration);
    const totalMarksNum = parseInt(total_marks);
    const passingMarksNum = parseInt(passing_marks);

    if (isNaN(durationNum) || durationNum <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid duration' });
    }

    if (isNaN(totalMarksNum) || totalMarksNum <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid total marks' });
    }

    if (isNaN(passingMarksNum) || passingMarksNum < 0 || passingMarksNum > totalMarksNum) {
      return res.status(400).json({ success: false, message: 'Invalid passing marks' });
    }

    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Convert and validate datetime fields
    let startTimeDate = null;
    let endTimeDate = null;

    if (is_scheduled) {
      if (start_time) {
        startTimeDate = new Date(start_time);
        if (isNaN(startTimeDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid start time format',
          });
        }
      }

      if (end_time) {
        endTimeDate = new Date(end_time);
        if (isNaN(endTimeDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid end time format',
          });
        }
      }

      // Validate time range
      if (startTimeDate && endTimeDate && startTimeDate >= endTimeDate) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time',
        });
      }
    }

    // Prepare values with proper date conversion
    const quizData = {
      title: title.trim(),
      description: description?.trim() || null,
      thumbnail: thumbnail?.trim() || null,
      category,
      difficulty,
      duration: durationNum,
      total_marks: totalMarksNum,
      passing_marks: passingMarksNum,
      price: price ? parseFloat(price) : 0,
      discount_price: discount_price ? parseFloat(discount_price) : null,
      isFree: Boolean(isFree),
      freeQuestionsCount: freeQuestionsCount ? parseInt(freeQuestionsCount) : 0, // ✅ ADDED
      instructor_id: user.id,
      course_id: course_id ? parseInt(course_id) : null,
      subjectId: subjectId ? parseInt(subjectId) : null, // ✅ ADDED
      chapterId: chapterId ? parseInt(chapterId) : null, // ✅ ADDED
      is_published: 0,
      is_scheduled: is_scheduled ? 1 : 0,
      start_time: startTimeDate,
      end_time: endTimeDate,
      shuffle_questions: shuffle_questions !== false ? 1 : 0,
      show_results: show_results !== false ? 1 : 0,
      negativeMarking: Boolean(negativeMarking),
      negativeMarksPerQuestion: negativeMarksPerQuestion ? parseFloat(negativeMarksPerQuestion) : 0,
      allowReview: allowReview !== false,
      showAnswerKey: showAnswerKey !== false,
      certificateEligible: Boolean(certificateEligible),
      attemptsAllowed: attemptsAllowed ? parseInt(attemptsAllowed) : 1,
      results_declared: 0,
      results_declaration_time: null,
      total_attempts: 0,
      total_students: 0,
    };

    // Create quiz
    const [newQuiz] = await db.insert(quizzes).values(quizData);
    const [createdQuiz] = await db.select().from(quizzes).where(eq(quizzes.id, newQuiz.insertId));

    await invalidateCache('api_cache:GET:/api/admin/quizzes*', 'api_cache:GET:/api/quizzes*');
    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz: createdQuiz,
    });
  } catch (error: any) {
    console.error('[CREATE QUIZ ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};


// ============================================
// UPDATE QUIZ - ✅ FIXED: Added freeQuestionsCount
// ============================================
export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quizId = parseInt(id);

    if (isNaN(quizId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID',
      });
    }

    const [existingQuiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));

    if (!existingQuiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    const updateData: any = {};

    // Field mapping with proper type conversion INCLUDING freeQuestionsCount
    const fieldHandlers: Record<string, (value: any) => any> = {
      title: (v) => v?.trim(),
      description: (v) => v?.trim() || null,
      thumbnail: (v) => v?.trim() || null,
      category: (v) => v,
      difficulty: (v) => v,
      duration: (v) => parseInt(v),
      total_marks: (v) => parseInt(v),
      passing_marks: (v) => parseInt(v),
      price: (v) => v ? parseFloat(v) : 0,
      discount_price: (v) => v ? parseFloat(v) : null,
      isFree: (v) => Boolean(v),
      freeQuestionsCount: (v) => v ? parseInt(v) : 0, // ✅ ADDED
      course_id: (v) => v ? parseInt(v) : null,
      subjectId: (v) => v ? parseInt(v) : null, // ✅ ADDED for test system
      chapterId: (v) => v ? parseInt(v) : null, // ✅ ADDED for test system
      is_scheduled: (v) => v ? 1 : 0,
      start_time: (v) => {
        if (!v) return null;
        const date = new Date(v);
        return isNaN(date.getTime()) ? null : date;
      },
      end_time: (v) => {
        if (!v) return null;
        const date = new Date(v);
        return isNaN(date.getTime()) ? null : date;
      },
      shuffle_questions: (v) => v ? 1 : 0,
      show_results: (v) => v ? 1 : 0,
      negativeMarking: (v) => Boolean(v),
      negativeMarksPerQuestion: (v) => v ? parseFloat(v) : 0,
      allowReview: (v) => Boolean(v),
      showAnswerKey: (v) => Boolean(v),
      certificateEligible: (v) => Boolean(v),
      attemptsAllowed: (v) => v ? parseInt(v) : 1,
      results_declared: (v) => v ? 1 : 0,
      results_declaration_time: (v) => {
        if (!v) return null;
        const date = new Date(v);
        return isNaN(date.getTime()) ? null : date;
      },
    };

    // Process each field
    Object.keys(fieldHandlers).forEach((field) => {
      if (req.body[field] !== undefined) {
        try {
          updateData[field] = fieldHandlers[field](req.body[field]);
        } catch (err) {
          console.error(`Error processing field ${field}:`, err);
        }
      }
    });

    // Validate if any fields were updated
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    // Validate passing_marks if total_marks is updated
    if (updateData.total_marks && updateData.passing_marks > updateData.total_marks) {
      return res.status(400).json({
        success: false,
        message: 'Passing marks cannot exceed total marks',
      });
    }

    // Validate scheduled quiz times
    if (updateData.start_time && updateData.end_time) {
      if (updateData.start_time >= updateData.end_time) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time',
        });
      }
    }

    // Update quiz
    await db.update(quizzes).set(updateData).where(eq(quizzes.id, quizId));

    // Fetch updated quiz
    const [updatedQuiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));

    await invalidateCache('api_cache:GET:/api/admin/quizzes*', 'api_cache:GET:/api/quizzes*');
    res.json({
      success: true,
      message: 'Quiz updated successfully',
      quiz: updatedQuiz,
    });
  } catch (error: any) {
    console.error('[UPDATE QUIZ ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};


// ============================================
// DELETE QUIZ
// ============================================
export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quizId = parseInt(id);

    if (isNaN(quizId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID',
      });
    }

    const [existingQuiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));

    if (!existingQuiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Delete in transaction-like manner (delete dependent records first)
    await db.delete(questions).where(eq(questions.quizId, quizId));
    await db.delete(quiz_attempts).where(eq(quiz_attempts.quiz_id, quizId));
    await db.delete(quizzes).where(eq(quizzes.id, quizId));

    await invalidateCache('api_cache:GET:/api/admin/quizzes*', 'api_cache:GET:/api/quizzes*');
    res.json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error: any) {
    console.error('[DELETE QUIZ ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};


// ============================================
// TOGGLE PUBLISH STATUS
// ============================================
export const togglePublish = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quizId = parseInt(id);

    if (isNaN(quizId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID',
      });
    }

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    const newStatus = quiz.is_published === 1 ? 0 : 1;

    await db
      .update(quizzes)
      .set({ is_published: newStatus })
      .where(eq(quizzes.id, quizId));

    const [updatedQuiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));

    await invalidateCache('api_cache:GET:/api/admin/quizzes*', 'api_cache:GET:/api/quizzes*');
    res.json({
      success: true,
      message: `Quiz ${newStatus === 1 ? 'published' : 'unpublished'} successfully`,
      quiz: updatedQuiz,
    });
  } catch (error: any) {
    console.error('[TOGGLE PUBLISH ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle publish status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};


// ============================================
// TOGGLE FREE STATUS
// ============================================
export const toggleFree = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quizId = parseInt(id);

    if (isNaN(quizId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID',
      });
    }

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    const newStatus = !quiz.isFree;

    await db
      .update(quizzes)
      .set({ isFree: newStatus })
      .where(eq(quizzes.id, quizId));

    const [updatedQuiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));

    await invalidateCache('api_cache:GET:/api/admin/quizzes*', 'api_cache:GET:/api/quizzes*');
    res.json({
      success: true,
      message: `Quiz marked as ${newStatus ? 'free' : 'paid'} successfully`,
      quiz: updatedQuiz,
    });
  } catch (error: any) {
    console.error('[TOGGLE FREE ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle free status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// ============================================
// TOGGLE FEATURED STATUS
// ============================================
export const toggleFeatured = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quizId = parseInt(id);

    if (isNaN(quizId)) {
      return res.status(400).json({ success: false, message: 'Invalid quiz ID' });
    }

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const newStatus = !quiz.isFeatured;
    await db.update(quizzes).set({ isFeatured: newStatus }).where(eq(quizzes.id, quizId));

    const [updatedQuiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
    await invalidateCache('api_cache:GET:/api/admin/quizzes*', 'api_cache:GET:/api/quizzes*');
    res.json({
      success: true,
      message: `Quiz ${newStatus ? 'featured' : 'unfeatured'} successfully`,
      quiz: updatedQuiz,
    });
  } catch (error: any) {
    console.error('[TOGGLE FEATURED ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle featured status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};


// ============================================
// UPDATE QUIZ PRICING
// ============================================
export const updateQuizPricing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quizId = parseInt(id);
    const { price, discount_price, isFree } = req.body;

    if (isNaN(quizId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID',
      });
    }

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    const priceNum = price ? parseFloat(price) : 0;
    const discountPriceNum = discount_price ? parseFloat(discount_price) : null;

    // Validate discount price
    if (discountPriceNum && discountPriceNum > priceNum) {
      return res.status(400).json({
        success: false,
        message: 'Discount price cannot exceed original price',
      });
    }

    await db
      .update(quizzes)
      .set({
        price: priceNum,
        discount_price: discountPriceNum,
        isFree: Boolean(isFree),
      })
      .where(eq(quizzes.id, quizId));

    const [updatedQuiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));

    await invalidateCache('api_cache:GET:/api/admin/quizzes*', 'api_cache:GET:/api/quizzes*');
    res.json({
      success: true,
      message: 'Quiz pricing updated successfully',
      quiz: updatedQuiz,
    });
  } catch (error: any) {
    console.error('[UPDATE QUIZ PRICING ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pricing',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};


// ============================================
// ADD QUESTIONS TO QUIZ (Bulk)
// ============================================
export const addQuestions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quizId = parseInt(id);
    const { questions: questionsData } = req.body;

    if (isNaN(quizId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID',
      });
    }

    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Questions array is required and must not be empty',
      });
    }

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // ✅ FIXED VALIDATION - Check for undefined/null instead of falsy
    const insertData = questionsData.map((q: any, index: number) => {
      // Validate required fields properly
      if (!q.question || !q.options) {
        throw new Error(`Question ${index + 1}: Missing question or options`);
      }

      // ✅ FIX: Allow 0 as a valid correctAnswer
      if (q.correctAnswer === undefined || q.correctAnswer === null) {
        throw new Error(`Question ${index + 1}: Missing correct answer`);
      }

      return {
        quizId,
        questionType: q.questionType || 'mcq',
        question: q.question.trim(),
        questionImage: q.questionImage?.trim() || null,
        options: JSON.stringify(q.options),
        correctAnswer: JSON.stringify(q.correctAnswer),
        explanation: q.explanation?.trim() || null,
        marks: q.marks ? parseInt(q.marks) : 1,
        negativeMarks: q.negativeMarks ? parseFloat(q.negativeMarks) : 0,
        difficulty: q.difficulty || 'medium',
        orderIndex: q.orderIndex !== undefined ? parseInt(q.orderIndex) : index,
      };
    });

    await db.insert(questions).values(insertData);

    // Get updated questions
    const allQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, quizId))
      .orderBy(questions.orderIndex);

    // Parse JSON fields
    const parsedQuestions = allQuestions.map((q) => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      correctAnswer: typeof q.correctAnswer === 'string' ? JSON.parse(q.correctAnswer) : q.correctAnswer,
    }));

    await invalidateCache('api_cache:GET:/api/admin/quizzes*', 'api_cache:GET:/api/quizzes*');
    res.status(201).json({
      success: true,
      message: `${questionsData.length} question(s) added successfully`,
      questions: parsedQuestions,
    });
  } catch (error: any) {
    console.error('[ADD QUESTIONS ERROR]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add questions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};


// ============================================
// UPDATE QUESTION
// ============================================
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id, questionId } = req.params;
    const quizId = parseInt(id);
    const qId = parseInt(questionId);

    if (isNaN(quizId) || isNaN(qId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz or question ID',
      });
    }

    const [existingQuestion] = await db
      .select()
      .from(questions)
      .where(and(eq(questions.id, qId), eq(questions.quizId, quizId)));

    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    const updateData: any = {};
    const fieldHandlers: Record<string, (value: any) => any> = {
      questionType: (v) => v,
      question: (v) => v?.trim(),
      questionImage: (v) => v?.trim() || null,
      options: (v) => JSON.stringify(v),
      correctAnswer: (v) => JSON.stringify(v),
      explanation: (v) => v?.trim() || null,
      marks: (v) => parseInt(v),
      negativeMarks: (v) => parseFloat(v),
      difficulty: (v) => v,
      orderIndex: (v) => parseInt(v),
    };

    Object.keys(fieldHandlers).forEach((field) => {
      if (req.body[field] !== undefined) {
        try {
          updateData[field] = fieldHandlers[field](req.body[field]);
        } catch (err) {
          console.error(`Error processing field ${field}:`, err);
        }
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    await db.update(questions).set(updateData).where(eq(questions.id, qId));

    const [updatedQuestion] = await db.select().from(questions).where(eq(questions.id, qId));

    // Parse JSON fields
    const parsedQuestion = {
      ...updatedQuestion,
      options: typeof updatedQuestion.options === 'string' ? JSON.parse(updatedQuestion.options) : updatedQuestion.options,
      correctAnswer: typeof updatedQuestion.correctAnswer === 'string' ? JSON.parse(updatedQuestion.correctAnswer) : updatedQuestion.correctAnswer,
    };

    await invalidateCache('api_cache:GET:/api/admin/quizzes*', 'api_cache:GET:/api/quizzes*');
    res.json({
      success: true,
      message: 'Question updated successfully',
      question: parsedQuestion,
    });
  } catch (error: any) {
    console.error('[UPDATE QUESTION ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update question',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};


// ============================================
// DELETE QUESTION
// ============================================
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id, questionId } = req.params;
    const quizId = parseInt(id);
    const qId = parseInt(questionId);

    if (isNaN(quizId) || isNaN(qId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz or question ID',
      });
    }

    const [existingQuestion] = await db
      .select()
      .from(questions)
      .where(and(eq(questions.id, qId), eq(questions.quizId, quizId)));

    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    await db.delete(questions).where(eq(questions.id, qId));

    await invalidateCache('api_cache:GET:/api/admin/quizzes*', 'api_cache:GET:/api/quizzes*');
    res.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error: any) {
    console.error('[DELETE QUESTION ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete question',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};


// ============================================
// GET QUIZ STATISTICS
// ============================================
export const getQuizStatistics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quizId = parseInt(id);

    if (isNaN(quizId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID',
      });
    }

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Get all attempts
    const attempts = await db
      .select()
      .from(quiz_attempts)
      .where(eq(quiz_attempts.quiz_id, quizId));

    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter((a) => a.is_passed === 1).length;
    const averageScore = totalAttempts > 0
      ? attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts
      : 0;
    const averagePercentage = totalAttempts > 0
      ? attempts.reduce((sum, a) => sum + Number(a.percentage), 0) / totalAttempts
      : 0;
    const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;
    const averageTimeTaken = totalAttempts > 0
      ? attempts.reduce((sum, a) => sum + a.time_taken, 0) / totalAttempts
      : 0;

    const scores = attempts.map((a) => Number(a.percentage));
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

    // Get question count
    const [questionCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions)
      .where(eq(questions.quizId, quizId));

    res.json({
      success: true,
      statistics: {
        totalAttempts,
        totalStudents: quiz.total_students,
        passedAttempts,
        failedAttempts: totalAttempts - passedAttempts,
        averageScore: parseFloat(averageScore.toFixed(2)),
        averagePercentage: parseFloat(averagePercentage.toFixed(2)),
        passRate: parseFloat(passRate.toFixed(2)),
        averageTimeTaken: Math.round(averageTimeTaken),
        highestScore,
        lowestScore,
        totalQuestions: Number(questionCount.count),
        totalMarks: quiz.total_marks,
        passingMarks: quiz.passing_marks,
      },
    });
  } catch (error: any) {
    console.error('[GET QUIZ STATISTICS ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};


// ============================================
// GET QUIZ RESULTS (All Attempts)
// ============================================
export const getQuizResults = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quizId = parseInt(id);
    const { page = '1', limit = '50' } = req.query;

    if (isNaN(quizId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID',
      });
    }

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const offset = (pageNum - 1) * limitNum;

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(quiz_attempts)
      .where(eq(quiz_attempts.quiz_id, quizId));

    const total = Number(countResult.count);

    // Get attempts with user info
    const results = await db
      .select({
        attempt: quiz_attempts,
        user: users,
      })
      .from(quiz_attempts)
      .leftJoin(users, eq(quiz_attempts.user_id, users.id))
      .where(eq(quiz_attempts.quiz_id, quizId))
      .orderBy(desc(quiz_attempts.completed_at))
      .limit(limitNum)
      .offset(offset);

    const formattedResults = results.map(({ attempt, user }) => ({
      ...attempt,
      userName: user?.name,
      userEmail: user?.email,
      quizTitle: quiz.title,
    }));

    res.json({
      success: true,
      results: formattedResults,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('[GET QUIZ RESULTS ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};


// ============================================
// EXPORT QUIZ QUESTIONS TO PDF
// ============================================
export const exportQuizQuestions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quizId = parseInt(id);

    if (isNaN(quizId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID',
      });
    }

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    const quizQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, quizId))
      .orderBy(questions.orderIndex);

    if (quizQuestions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions found for this quiz',
      });
    }

    // Parse JSON fields
    const parsedQuestions = quizQuestions.map((q) => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      correctAnswer: typeof q.correctAnswer === 'string' ? JSON.parse(q.correctAnswer) : q.correctAnswer,
    }));

    await exportQuizQuestionsToPDF(res, quiz, parsedQuestions);
  } catch (error: any) {
    console.error('[EXPORT QUIZ QUESTIONS ERROR]', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to export quiz questions',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }
};


// ============================================
// EXPORT QUIZ RESULTS TO PDF
// ============================================
export const exportQuizResultsPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quizId = parseInt(id);

    if (isNaN(quizId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID',
      });
    }

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Get all attempts with user info
    const results = await db
      .select({
        attempt: quiz_attempts,
        user: users,
      })
      .from(quiz_attempts)
      .leftJoin(users, eq(quiz_attempts.user_id, users.id))
      .where(eq(quiz_attempts.quiz_id, quizId))
      .orderBy(desc(quiz_attempts.score));

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No results found for this quiz',
      });
    }

    const formattedResults = results.map(({ attempt, user }) => ({
      ...attempt,
      userName: user?.name || 'Unknown',
      userEmail: user?.email || 'N/A',
      quizTitle: quiz.title,
    }));

    // Calculate statistics
    const totalAttempts = results.length;
    const passedAttempts = results.filter((r) => r.attempt.is_passed === 1).length;
    const averageScore = results.reduce((sum, r) => sum + Number(r.attempt.percentage), 0) / totalAttempts;
    const passRate = (passedAttempts / totalAttempts) * 100;
    const averageTimeTaken = results.reduce((sum, r) => sum + r.attempt.time_taken, 0) / totalAttempts;
    const scores = results.map((r) => Number(r.attempt.percentage));
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    const statistics = {
      totalAttempts,
      averageScore: parseFloat(averageScore.toFixed(2)),
      passRate: parseFloat(passRate.toFixed(2)),
      averageTimeTaken: Math.round(averageTimeTaken),
      highestScore,
      lowestScore,
    };

    await exportQuizResultsToPDF(res, quiz, formattedResults, statistics);
  } catch (error: any) {
    console.error('[EXPORT QUIZ RESULTS PDF ERROR]', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to export results',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }
};
