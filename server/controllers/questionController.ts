// server/controllers/questionController.ts
import { Request, Response } from 'express';
import { db } from '../config/db';
import { questions, quizzes } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export async function getQuestionsByQuizId(req: Request, res: Response): Promise<Response> {
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
      return res.status(403).json({ success: false, message: 'You can only view questions from your own quizzes' });
    }

    const quizQuestions = await db.select().from(questions).where(eq(questions.quizId, quizId));
    return res.json({ success: true, count: quizQuestions.length, questions: quizQuestions });
  } catch (error: any) {
    console.error('[GET QUESTIONS ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch questions', error: error.message });
  }
}

export async function addQuestion(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;
    const quizId = Number(req.params.quizId);

    if (!['instructor', 'admin'].includes(user?.role)) {
      return res.status(403).json({ success: false, message: 'Only instructors and admins can add questions' });
    }

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (user.role !== 'admin' && quiz.instructor_id !== userId) {
      return res.status(403).json({ success: false, message: 'You can only add questions to your own quizzes' });
    }

    const { question, options, correctAnswer, explanation, marks } = req.body;

    if (!question || !options || correctAnswer === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields: question, options, correctAnswer' });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ success: false, message: 'Options must be an array with at least 2 choices' });
    }

    if (correctAnswer < 0 || correctAnswer >= options.length) {
      return res.status(400).json({ success: false, message: 'Invalid correct answer index' });
    }

    const [result] = await db.insert(questions).values({
      quizId,
      question,
      options: JSON.stringify(options),
      correctAnswer,
      explanation: explanation || null,
      marks: marks || 1,
    });

    return res.status(201).json({ success: true, message: 'Question added successfully', questionId: result.insertId });
  } catch (error: any) {
    console.error('[ADD QUESTION ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to add question', error: error.message });
  }
}

export async function addBulkQuestions(req: Request, res: Response): Promise<Response> {
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

    const { questions: questionsList } = req.body;

    if (!Array.isArray(questionsList) || questionsList.length === 0) {
      return res.status(400).json({ success: false, message: 'Questions must be a non-empty array' });
    }

    for (const q of questionsList) {
      if (!q.question || !q.options || q.correctAnswer === undefined) {
        return res.status(400).json({ success: false, message: 'Each question must have: question, options, correctAnswer' });
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return res.status(400).json({ success: false, message: 'Each question must have at least 2 options' });
      }
    }

    const values = questionsList.map((q) => ({
      quizId,
      question: q.question,
      options: JSON.stringify(q.options),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || null,
      marks: q.marks || 1,
    }));

    await db.insert(questions).values(values);
    return res.status(201).json({ success: true, message: `${questionsList.length} questions added successfully`, count: questionsList.length });
  } catch (error: any) {
    console.error('[ADD BULK QUESTIONS ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to add questions', error: error.message });
  }
}

export async function updateQuestion(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;
    const questionId = Number(req.params.id);

    if (!['instructor', 'admin'].includes(user?.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [existingQuestion] = await db.select().from(questions).where(eq(questions.id, questionId)).limit(1);
    if (!existingQuestion) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, existingQuestion.quizId)).limit(1);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Associated quiz not found' });
    }

    if (user.role !== 'admin' && quiz.instructor_id !== userId) {
      return res.status(403).json({ success: false, message: 'You can only update questions from your own quizzes' });
    }

    const updateData: any = { ...req.body };
    delete updateData.id;
    delete updateData.quizId;
    delete updateData.createdAt;

    if (updateData.options) {
      if (!Array.isArray(updateData.options) || updateData.options.length < 2) {
        return res.status(400).json({ success: false, message: 'Options must be an array with at least 2 choices' });
      }
      updateData.options = JSON.stringify(updateData.options);
    }

    if (updateData.correctAnswer !== undefined) {
      const optionsArray = updateData.options ? JSON.parse(updateData.options) : JSON.parse(existingQuestion.options as string);
      if (updateData.correctAnswer < 0 || updateData.correctAnswer >= optionsArray.length) {
        return res.status(400).json({ success: false, message: 'Invalid correct answer index' });
      }
    }

    await db.update(questions).set(updateData).where(eq(questions.id, questionId));
    return res.json({ success: true, message: 'Question updated successfully' });
  } catch (error: any) {
    console.error('[UPDATE QUESTION ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to update question', error: error.message });
  }
}

export async function deleteQuestion(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;
    const questionId = Number(req.params.id);

    if (!['instructor', 'admin'].includes(user?.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [question] = await db.select().from(questions).where(eq(questions.id, questionId)).limit(1);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, question.quizId)).limit(1);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Associated quiz not found' });
    }

    if (user.role !== 'admin' && quiz.instructor_id !== userId) {
      return res.status(403).json({ success: false, message: 'You can only delete questions from your own quizzes' });
    }

    await db.delete(questions).where(eq(questions.id, questionId));
    return res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error: any) {
    console.error('[DELETE QUESTION ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to delete question', error: error.message });
  }
}

export async function getQuestionById(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;
    const questionId = Number(req.params.id);

    if (!['instructor', 'admin'].includes(user?.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [question] = await db.select().from(questions).where(eq(questions.id, questionId)).limit(1);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, question.quizId)).limit(1);
    if (user.role !== 'admin' && quiz?.instructor_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.json({ success: true, question });
  } catch (error: any) {
    console.error('[GET QUESTION BY ID ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch question', error: error.message });
  }
}
