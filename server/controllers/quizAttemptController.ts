// server/controllers/quizAttemptController.ts
import { Request, Response } from 'express';
import { db } from '../config/db';
import { quiz_attempts, quizzes, questions, users, quiz_access } from '../../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function submitQuizAttempt(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).userId;
    const quizId = Number(req.params.quizId);
    const { answers, timeTaken } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'You must be logged in to submit quiz' });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Invalid answers format' });
    }


    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (!quiz.is_published) {
      return res.status(403).json({ success: false, message: 'This quiz is not available' });
    }

    // Authorization: check access for paid quizzes
    if (!quiz.isFree) {
      const [access] = await db.select().from(quiz_access).where(and(
        eq(quiz_access.userId, userId),
        eq(quiz_access.quizId, quizId)
      ));
      if (!access) {
        return res.status(403).json({
          success: false,
          message: 'You must purchase this quiz first',
        });
      }
    }

    const now = new Date();
    if (quiz.is_scheduled && quiz.end_time && new Date(quiz.end_time) < now) {
      return res.status(403).json({ success: false, message: 'Quiz has ended' });
    }

    // ✅ BUG-017 FIX: Wrap in transaction to prevent race condition on concurrent attempts
    const result = await db.transaction(async (tx) => {
      // ✅ BUG-021 FIX: Use COUNT(*) instead of loading all rows
      const [countResult] = await tx
        .select({ count: sql<number>`COUNT(*)` })
        .from(quiz_attempts)
        .where(and(eq(quiz_attempts.user_id, userId), eq(quiz_attempts.quiz_id, quizId)));

      const attemptCount = Number(countResult?.count || 0);
      const attemptsAllowed = quiz.attemptsAllowed || 1;

      if (attemptCount >= attemptsAllowed) {
        throw { statusCode: 400, message: `You have used all ${attemptsAllowed} attempt(s) for this quiz.` };
      }

      const quizQuestions = await tx.select().from(questions).where(eq(questions.quizId, quizId));
      if (quizQuestions.length === 0) {
        throw { statusCode: 400, message: 'Quiz has no questions' };
      }

      let score = 0;
      let correctAnswers = 0;
      let wrongAnswers = 0;
      let skippedAnswers = 0;

      const evaluatedAnswers = answers.map((userAnswer: any) => {
        const question = quizQuestions.find((q) => q.id === userAnswer.questionId);
        if (!question) {
          return { ...userAnswer, isCorrect: false, correctAnswer: null };
        }

        let correctAnswer = question.correctAnswer;
        if (typeof correctAnswer === 'string') {
          try {
            correctAnswer = JSON.parse(correctAnswer);
          } catch (e) { /* use as-is */ }
        }

        const isSkipped = userAnswer.selectedOption === null || userAnswer.selectedOption === undefined;
        const isCorrect = !isSkipped && userAnswer.selectedOption === correctAnswer;

        if (isSkipped) skippedAnswers++;
        else if (isCorrect) {
          correctAnswers++;
          score += question.marks;
        } else {
          wrongAnswers++;
          // ✅ BUG-028 FIX: Apply negative marking when enabled
          if (quiz.negativeMarking && question.negativeMarks) {
            score -= Number(question.negativeMarks);
          }
        }

        return {
          questionId: userAnswer.questionId,
          selectedOption: userAnswer.selectedOption,
          correctAnswer: correctAnswer,
          isCorrect,
          marks: isCorrect ? question.marks : (quiz.negativeMarking && question.negativeMarks ? -Number(question.negativeMarks) : 0),
        };
      });

      const totalMarks = quizQuestions.reduce((sum, q) => sum + q.marks, 0);
      const percentage = totalMarks > 0 ? ((Math.max(0, score) / totalMarks) * 100).toFixed(2) : '0.00';
      const isPassed = score >= quiz.passing_marks;

      const [insertResult] = await tx.insert(quiz_attempts).values({
        user_id: userId,
        quiz_id: quizId,
        score: Math.max(0, score),  // Don't store negative total score
        total_questions: quizQuestions.length,
        correct_answers: correctAnswers,
        wrong_answers: wrongAnswers,
        skipped_answers: skippedAnswers,
        time_taken: timeTaken || 0,
        answers: JSON.stringify(evaluatedAnswers),
        is_passed: isPassed ? 1 : 0,
        percentage: percentage,
        status: quiz.results_declared ? 'evaluated' : 'submitted',
        result_viewed: 0,
      });

      // Update quiz attempt count
      await tx.update(quizzes)
        .set({ total_attempts: sql`${quizzes.total_attempts} + 1` })
        .where(eq(quizzes.id, quizId));

      // ✅ BUG-032 FIX: Increment total_students on first unique attempt
      if (attemptCount === 0) {
        await tx.update(quizzes)
          .set({ total_students: sql`${quizzes.total_students} + 1` })
          .where(eq(quizzes.id, quizId));
      }

      return {
        insertId: insertResult.insertId,
        score: Math.max(0, score),
        totalMarks,
        percentage: parseFloat(percentage),
        correctAnswers,
        wrongAnswers,
        skippedAnswers,
        totalQuestions: quizQuestions.length,
        isPassed,
        evaluatedAnswers,
        attemptCount,
        attemptsAllowed,
      };
    });

    if (quiz.results_declared) {
      return res.status(201).json({
        success: true,
        message: 'Quiz submitted successfully',
        attemptId: result.insertId,
        showResults: true,
        result: {
          score: result.score,
          totalMarks: result.totalMarks,
          percentage: result.percentage,
          correctAnswers: result.correctAnswers,
          wrongAnswers: result.wrongAnswers,
          skippedAnswers: result.skippedAnswers,
          totalQuestions: result.totalQuestions,
          isPassed: result.isPassed,
          passingMarks: quiz.passing_marks,
          timeTaken,
          answers: quiz.show_results ? result.evaluatedAnswers : null,
          attemptNumber: result.attemptCount + 1,
          attemptsAllowed: result.attemptsAllowed,
          attemptsRemaining: result.attemptsAllowed - (result.attemptCount + 1),
        },
      });
    } else {
      return res.status(201).json({
        success: true,
        message: 'Quiz submitted successfully! Your results will be shared soon.',
        attemptId: result.insertId,
        showResults: false,
        pendingEvaluation: true,
        attemptNumber: result.attemptCount + 1,
        attemptsAllowed: result.attemptsAllowed,
        attemptsRemaining: result.attemptsAllowed - (result.attemptCount + 1),
      });
    }
  } catch (error: any) {
    // Handle structured errors from transaction
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    console.error('[SUBMIT QUIZ ATTEMPT ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to submit quiz' });
  }
}


export async function getQuizAttemptById(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).userId;
    const attemptId = Number(req.params.attemptId);

    const [attempt] = await db.select().from(quiz_attempts).where(eq(quiz_attempts.id, attemptId)).limit(1);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    const user = (req as any).user;
    if (user.role !== 'admin' && attempt.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, attempt.quiz_id)).limit(1);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (!quiz.results_declared && user.role !== 'admin') {
      return res.json({
        success: true,
        attempt: {
          id: attempt.id,
          quizTitle: quiz.title,
          status: attempt.status,
          submittedAt: attempt.completed_at,
          resultsAvailable: false,
          message: 'Results will be shared soon',
        },
      });
    }

    if (!attempt.result_viewed) {
      await db.update(quiz_attempts).set({ result_viewed: 1 }).where(eq(quiz_attempts.id, attemptId));
    }

    return res.json({
      success: true,
      attempt: {
        id: attempt.id,
        quizId: quiz.id,
        quizTitle: quiz.title,
        score: attempt.score,
        totalMarks: quiz.total_marks,
        correctAnswers: attempt.correct_answers,
        wrongAnswers: attempt.wrong_answers,
        skippedAnswers: attempt.skipped_answers,
        totalQuestions: attempt.total_questions,
        isPassed: attempt.is_passed === 1,
        passingMarks: quiz.passing_marks,
        timeTaken: attempt.time_taken,
        submittedAt: attempt.completed_at,
        status: attempt.status,
        answers: quiz.show_results ? JSON.parse(attempt.answers as string) : null,
        resultsAvailable: true,
      },
    });
  } catch (error: any) {
    console.error('[GET QUIZ ATTEMPT ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch attempt', ...(process.env.NODE_ENV === 'development' && { error: error.message }) });
  }
}

export async function getUserAttempts(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).userId;

    const userAttempts = await db
      .select({
        id: quiz_attempts.id,
        quizId: quiz_attempts.quiz_id,
        score: quiz_attempts.score,
        totalQuestions: quiz_attempts.total_questions,
        correctAnswers: quiz_attempts.correct_answers,
        isPassed: quiz_attempts.is_passed,
        status: quiz_attempts.status,
        completedAt: quiz_attempts.completed_at,
        resultViewed: quiz_attempts.result_viewed,
        quizTitle: quizzes.title,
        totalMarks: quizzes.total_marks,
        passingMarks: quizzes.passing_marks,
        resultsDeclared: quizzes.results_declared,
      })
      .from(quiz_attempts)
      .leftJoin(quizzes, eq(quiz_attempts.quiz_id, quizzes.id))
      .where(eq(quiz_attempts.user_id, userId))
      .orderBy(desc(quiz_attempts.completed_at));

    return res.json({ success: true, count: userAttempts.length, attempts: userAttempts });
  } catch (error: any) {
    console.error('[GET USER ATTEMPTS ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch attempts', ...(process.env.NODE_ENV === 'development' && { error: error.message }) });
  }
}

export async function getQuizAttempts(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;
    const quizId = Number(req.params.quizId);

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

    const attempts = await db
      .select({
        id: quiz_attempts.id,
        userId: quiz_attempts.user_id,
        userName: users.name,
        userEmail: users.email,
        score: quiz_attempts.score,
        totalQuestions: quiz_attempts.total_questions,
        correctAnswers: quiz_attempts.correct_answers,
        wrongAnswers: quiz_attempts.wrong_answers,
        skippedAnswers: quiz_attempts.skipped_answers,
        timeTaken: quiz_attempts.time_taken,
        isPassed: quiz_attempts.is_passed,
        status: quiz_attempts.status,
        completedAt: quiz_attempts.completed_at,
      })
      .from(quiz_attempts)
      .leftJoin(users, eq(quiz_attempts.user_id, users.id))
      .where(eq(quiz_attempts.quiz_id, quizId))
      .orderBy(desc(quiz_attempts.completed_at));

    return res.json({
      success: true,
      count: attempts.length,
      quizTitle: quiz.title,
      totalMarks: quiz.total_marks,
      passingMarks: quiz.passing_marks,
      attempts,
    });
  } catch (error: any) {
    console.error('[GET QUIZ ATTEMPTS ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch attempts', ...(process.env.NODE_ENV === 'development' && { error: error.message }) });
  }
}

export async function getQuizStatistics(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;
    const quizId = Number(req.params.quizId);

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

    const [stats] = await db
      .select({
        totalAttempts: sql<number>`COUNT(*)`,
        avgScore: sql<number | null>`AVG(${quiz_attempts.score})`,
        avgTimeTaken: sql<number | null>`AVG(${quiz_attempts.time_taken})`,
        passedCount: sql<number | null>`SUM(CASE WHEN ${quiz_attempts.is_passed} = 1 THEN 1 ELSE 0 END)`,
        failedCount: sql<number | null>`SUM(CASE WHEN ${quiz_attempts.is_passed} = 0 THEN 1 ELSE 0 END)`,
      })
      .from(quiz_attempts)
      .where(eq(quiz_attempts.quiz_id, quizId));

    const totalAttempts = Number(stats?.totalAttempts || 0);
    const avgScoreNum = stats?.avgScore != null ? Number(stats.avgScore) : 0;
    const avgTimeNum = stats?.avgTimeTaken != null ? Number(stats.avgTimeTaken) : 0;
    const passedCountNum = stats?.passedCount != null ? Number(stats.passedCount) : 0;
    const failedCountNum = stats?.failedCount != null ? Number(stats.failedCount) : 0;

    const passRate =
      totalAttempts > 0 ? Number(((passedCountNum / totalAttempts) * 100).toFixed(2)) : 0;

    return res.json({
      success: true,
      statistics: {
        totalAttempts,
        averageScore: Number(avgScoreNum.toFixed(2)),
        averageTimeTaken: Math.round(avgTimeNum),
        passedCount: passedCountNum,
        failedCount: failedCountNum,
        passRate,
        totalMarks: quiz.total_marks,
        passingMarks: quiz.passing_marks,
      },
    });
  } catch (error: any) {
    console.error('[GET QUIZ STATISTICS ERROR]', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch statistics', ...(process.env.NODE_ENV === 'development' && { error: error.message }) });
  }
}

