// server/controllers/adminPaymentController.ts
import { Request, Response } from "express";
import { db } from "../config/db";
import { payments, users, courses, quizzes } from "../../shared/schema";
import { and, eq, desc, sql } from "drizzle-orm";

/**
 * GET /api/admin/payments/all
 */
export const getAllPayments = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { status, type, search, limit = '50', offset = '0' } = req.query;

    console.log('[ADMIN - GET ALL PAYMENTS] Query params:', { status, type, search, limit, offset });

    let conditions = [];
    
    if (status && status !== 'all') {
      conditions.push(eq(payments.status, status as string));
    }

    if (type === 'course') {
      conditions.push(sql`${payments.courseId} IS NOT NULL`);
    } else if (type === 'quiz') {
      conditions.push(sql`${payments.quizId} IS NOT NULL`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select({
        payment: payments,
        user: users,
        course: courses,
        quiz: quizzes,
      })
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .leftJoin(courses, eq(payments.courseId, courses.id))
      .leftJoin(quizzes, eq(payments.quizId, quizzes.id))
      .where(whereClause)
      .orderBy(desc(payments.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    console.log('[ADMIN - GET ALL PAYMENTS] Found:', results.length, 'payments');

    const formattedPayments = results.map((r) => ({
      id: r.payment.id,
      orderId: r.payment.orderId,
      transactionId: r.payment.transactionId || 'N/A',
      paymentId: r.payment.paymentId || null,
      userName: r.user?.name || 'Unknown User',
      userEmail: r.user?.email || 'N/A',
      itemType: r.payment.courseId ? 'course' : 'quiz',
      itemName: r.course?.title || r.quiz?.title || 'Unknown Item',
      amount: Number(r.payment.amount),
      status: r.payment.status,
      paymentMethod: r.payment.method || 'Razorpay',
      signature: r.payment.signature || null,
      createdAt: r.payment.createdAt,
    }));

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(payments)
      .where(whereClause);

    console.log('[ADMIN - GET ALL PAYMENTS] Success');

    return res.json({
      success: true,
      payments: formattedPayments,
      total: Number(count),
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error: any) {
    console.error('[ADMIN - GET ALL PAYMENTS ERROR]', {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      ...(process.env.NODE_ENV === 'development' && { ...(process.env.NODE_ENV === 'development' && { error: error.message }) }),
    });
  }
};

/**
 * GET /api/admin/payments/stats
 */
export const getPaymentStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    console.log('[ADMIN - GET PAYMENT STATS] Starting...');

    const [stats] = await db
      .select({
        totalPayments: sql<number>`COUNT(*)`,
        totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${payments.status} = 'success' THEN ${payments.amount} ELSE 0 END), 0)`,
        successfulPayments: sql<number>`COUNT(CASE WHEN ${payments.status} = 'success' THEN 1 END)`,
        pendingPayments: sql<number>`COUNT(CASE WHEN ${payments.status} = 'pending' THEN 1 END)`,
        failedPayments: sql<number>`COUNT(CASE WHEN ${payments.status} = 'failed' THEN 1 END)`,
      })
      .from(payments);

    console.log('[ADMIN - GET PAYMENT STATS] Success:', stats);

    return res.json({
      success: true,
      stats: {
        totalPayments: Number(stats.totalPayments),
        totalRevenue: Number(stats.totalRevenue || 0),
        successfulPayments: Number(stats.successfulPayments),
        pendingPayments: Number(stats.pendingPayments),
        failedPayments: Number(stats.failedPayments),
      },
    });
  } catch (error: any) {
    console.error('[ADMIN - GET PAYMENT STATS ERROR]', {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment stats',
      ...(process.env.NODE_ENV === 'development' && { ...(process.env.NODE_ENV === 'development' && { error: error.message }) }),
    });
  }
};
