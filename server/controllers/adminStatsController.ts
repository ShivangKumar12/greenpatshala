// server/controllers/adminStatsController.ts - UNIFIED FOR ADMIN & INSTRUCTOR
import { Request, Response } from 'express';
import { db } from '../config/db';
import {
  users,
  courses,
  quizzes,
  payments,
  jobs,
  studyMaterials,
  currentAffairs,
  feedbacks,
  testimonials,
  coupons,
  enrollments,
  quiz_attempts,
} from '../../shared/schema';
import { sql, eq, and, desc } from 'drizzle-orm';

// ============================================
// GET STATS (ADMIN & INSTRUCTOR)
// ============================================
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    // ============================================
    // ADMIN STATS (ALL DATA)
    // ============================================
    if (userRole === 'admin') {
      const [
        usersCount,
        coursesCount,
        quizzesCount,
        revenueSum,
        jobsCount,
        materialsCount,
        affairsCount,
        paymentsCount,
        pendingPaymentsCount,
        feedbacksCount,
        testimonialsCount,
        couponsCount,
        activeCouponsCount,
      ] = await Promise.all([
        // Total Users
        db.select({ count: sql<number>`count(*)` }).from(users),

        // Total Courses
        db.select({ count: sql<number>`count(*)` }).from(courses).where(eq(courses.isPublished, true)),

        // Total Quizzes
        db.select({ count: sql<number>`count(*)` }).from(quizzes).where(eq(quizzes.is_published, 1)),

        // Total Revenue
        db
          .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
          .from(payments)
          .where(eq(payments.status, 'success')),

        // Active Jobs
        db.select({ count: sql<number>`count(*)` }).from(jobs).where(eq(jobs.status, 'active')),

        // Study Materials
        db.select({ count: sql<number>`count(*)` }).from(studyMaterials),

        // Current Affairs
        db.select({ count: sql<number>`count(*)` }).from(currentAffairs),

        // Total Payments
        db.select({ count: sql<number>`count(*)` }).from(payments),

        // Pending Payments
        db.select({ count: sql<number>`count(*)` }).from(payments).where(eq(payments.status, 'pending')),

        // Total Feedbacks
        db.select({ count: sql<number>`count(*)` }).from(feedbacks),

        // Success Stories
        db.select({ count: sql<number>`count(*)` }).from(testimonials).where(eq(testimonials.isActive, true)),

        // Total Coupons
        db.select({ count: sql<number>`count(*)` }).from(coupons),

        // Active Coupons
        db
          .select({ count: sql<number>`count(*)` })
          .from(coupons)
          .where(
            and(
              eq(coupons.isActive, true),
              sql`${coupons.validUntil} > NOW()`
            )
          ),
      ]);

      // Calculate recent payments (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [recentPaymentsCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(payments)
        .where(
          and(
            eq(payments.status, 'success'),
            sql`${payments.createdAt} >= ${thirtyDaysAgo.toISOString()}`
          )
        );

      return res.json({
        success: true,
        stats: {
          totalUsers: Number(usersCount[0]?.count || 0),
          totalCourses: Number(coursesCount[0]?.count || 0),
          totalQuizzes: Number(quizzesCount[0]?.count || 0),
          totalRevenue: Number(revenueSum[0]?.total || 0),
          activeJobs: Number(jobsCount[0]?.count || 0),
          studyMaterials: Number(materialsCount[0]?.count || 0),
          currentAffairs: Number(affairsCount[0]?.count || 0),
          recentPayments: Number(recentPaymentsCount?.count || 0),
          totalPayments: Number(paymentsCount[0]?.count || 0),
          pendingPayments: Number(pendingPaymentsCount[0]?.count || 0),
          totalFeedback: Number(feedbacksCount[0]?.count || 0),
          successStories: Number(testimonialsCount[0]?.count || 0),
          totalCoupons: Number(couponsCount[0]?.count || 0),
          activeCoupons: Number(activeCouponsCount[0]?.count || 0),
        },
      });
    }


    // ============================================
    // INSTRUCTOR STATS (FILTERED BY INSTRUCTOR ID)
    // ============================================
    if (userRole === 'instructor') {
      const [
        totalCoursesCount,
        publishedCoursesCount,
        totalQuizzesCount,
        publishedQuizzesCount,
        totalStudentsCount,
        totalAttemptsCount,
      ] = await Promise.all([
        // Total courses created by instructor
        db
          .select({ count: sql<number>`count(*)` })
          .from(courses)
          .where(eq(courses.instructorId, userId)),

        // Published courses
        db
          .select({ count: sql<number>`count(*)` })
          .from(courses)
          .where(
            and(
              eq(courses.instructorId, userId),
              eq(courses.isPublished, true)
            )
          ),

        // Total quizzes created by instructor
        db
          .select({ count: sql<number>`count(*)` })
          .from(quizzes)
          .where(eq(quizzes.instructor_id, userId)),

        // Published quizzes
        db
          .select({ count: sql<number>`count(*)` })
          .from(quizzes)
          .where(
            and(
              eq(quizzes.instructor_id, userId),
              eq(quizzes.is_published, 1)
            )
          ),

        // Total students (unique users enrolled in instructor's courses)
        db
          .select({ count: sql<number>`COUNT(DISTINCT ${ enrollments.userId })` })
          .from(enrollments)
          .innerJoin(courses, eq(enrollments.courseId, courses.id))
          .where(eq(courses.instructorId, userId)),

        // Total quiz attempts for instructor's quizzes
        db
          .select({ count: sql<number>`count(*)` })
          .from(quiz_attempts)
          .innerJoin(quizzes, eq(quiz_attempts.quiz_id, quizzes.id))
          .where(eq(quizzes.instructor_id, userId)),
      ]);

      return res.json({
        success: true,
        stats: {
          totalCourses: Number(totalCoursesCount[0]?.count || 0),
          publishedCourses: Number(publishedCoursesCount[0]?.count || 0),
          totalQuizzes: Number(totalQuizzesCount[0]?.count || 0),
          publishedQuizzes: Number(publishedQuizzesCount[0]?.count || 0),
          totalStudents: Number(totalStudentsCount[0]?.count || 0),
          totalAttempts: Number(totalAttemptsCount[0]?.count || 0),
        },
      });
    }

    // If neither admin nor instructor
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  } catch (error: any) {
    console.error('❌ [GET STATS ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
};

// ============================================
// GET RECENT COURSES (ADMIN & INSTRUCTOR)
// ============================================
export const getRecentCourses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;
    const limit = Math.min(Number(req.query.limit) || 5, 20);

    let recentCourses;

    if (userRole === 'admin') {
      // Admin sees all courses
      recentCourses = await db
        .select({
          id: courses.id,
          title: courses.title,
          thumbnail: courses.thumbnail,
          totalStudents: courses.totalStudents,
          isPublished: courses.isPublished,
          createdAt: courses.createdAt,
        })
        .from(courses)
        .orderBy(desc(courses.createdAt))
        .limit(limit);
    } else if (userRole === 'instructor') {
      // Instructor sees only their courses
      recentCourses = await db
        .select({
          id: courses.id,
          title: courses.title,
          thumbnail: courses.thumbnail,
          totalStudents: courses.totalStudents,
          isPublished: courses.isPublished,
          createdAt: courses.createdAt,
        })
        .from(courses)
        .where(eq(courses.instructorId, userId))
        .orderBy(desc(courses.createdAt))
        .limit(limit);
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    return res.json({
      success: true,
      courses: recentCourses,
    });
  } catch (error: any) {
    console.error('❌ [GET RECENT COURSES ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recent courses',
    });
  }
};

// ============================================
// GET RECENT QUIZZES (ADMIN & INSTRUCTOR)
// ============================================
export const getRecentQuizzes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;
    const limit = Math.min(Number(req.query.limit) || 5, 20);

    let recentQuizzes;

    if (userRole === 'admin') {
      // Admin sees all quizzes
      recentQuizzes = await db
        .select({
          id: quizzes.id,
          title: quizzes.title,
          thumbnail: quizzes.thumbnail,
          total_students: quizzes.total_students,
          total_attempts: quizzes.total_attempts,
          is_published: quizzes.is_published,
          created_at: quizzes.created_at,
        })
        .from(quizzes)
        .orderBy(desc(quizzes.created_at))
        .limit(limit);
    } else if (userRole === 'instructor') {
      // Instructor sees only their quizzes
      recentQuizzes = await db
        .select({
          id: quizzes.id,
          title: quizzes.title,
          thumbnail: quizzes.thumbnail,
          total_students: quizzes.total_students,
          total_attempts: quizzes.total_attempts,
          is_published: quizzes.is_published,
          created_at: quizzes.created_at,
        })
        .from(quizzes)
        .where(eq(quizzes.instructor_id, userId))
        .orderBy(desc(quizzes.created_at))
        .limit(limit);
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    return res.json({
      success: true,
      quizzes: recentQuizzes,
    });
  } catch (error: any) {
    console.error('❌ [GET RECENT QUIZZES ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recent quizzes',
    });
  }
};

// ============================================
// GET RECENT PAYMENTS (ADMIN ONLY)
// ============================================
export const getRecentPayments = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 5, 20);

    const recentPayments = await db
      .select({
        id: payments.id,
        userId: payments.userId,
        amount: payments.amount,
        status: payments.status,
        createdAt: payments.createdAt,
        courseId: payments.courseId,
        quizId: payments.quizId,
      })
      .from(payments)
      .where(eq(payments.status, 'success'))
      .orderBy(desc(payments.createdAt))
      .limit(limit);

    // Fetch user names
    const paymentsWithDetails = await Promise.all(
      recentPayments.map(async (payment) => {
        const [user] = await db.select({ name: users.name }).from(users).where(eq(users.id, payment.userId));

        let itemName = 'Unknown Item';
        if (payment.courseId) {
          const [course] = await db
            .select({ title: courses.title })
            .from(courses)
            .where(eq(courses.id, payment.courseId));
          itemName = course?.title || 'Course';
        } else if (payment.quizId) {
          const [quiz] = await db
            .select({ title: quizzes.title })
            .from(quizzes)
            .where(eq(quizzes.id, payment.quizId));
          itemName = quiz?.title || 'Quiz';
        }

        return {
          id: payment.id,
          user: user?.name || 'Unknown User',
          item: itemName,
          amount: Number(payment.amount),
          date: new Date(payment.createdAt).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          status: payment.status,
        };
      })
    );

    return res.json({
      success: true,
      payments: paymentsWithDetails,
    });
  } catch (error: any) {
    console.error('❌ [GET RECENT PAYMENTS ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recent payments',
    });
  }
};
