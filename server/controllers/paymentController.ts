// server/controllers/paymentController.ts - WITH STUDY MATERIAL SUPPORT + FIXED transactionId
import { Request, Response } from "express";
import crypto from "crypto";
import { db } from "../config/db";
import { razorpay } from "../config/razorpay";
import {
  coupons,
  courses,
  enrollments,
  payments,
  quizzes,
  quiz_access,
  studyMaterials,
  studyMaterialPurchases,
} from "../../shared/schema";
import { and, eq, gt, lte } from "drizzle-orm";

/**
 * Helper: apply coupon on a base amount.
 */
async function applyCoupon(
  baseAmount: number,
  couponCode?: string
): Promise<{
  finalAmount: number;
  appliedCoupon: { id: number; code: string } | null;
}> {
  if (!couponCode) {
    return { finalAmount: baseAmount, appliedCoupon: null };
  }

  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  const [coupon] = await db
    .select()
    .from(coupons)
    .where(
      and(
        eq(coupons.code, couponCode),
        eq(coupons.isActive, true),
        lte(coupons.validFrom, now),
        gt(coupons.validUntil, now)
      )
    )
    .limit(1);

  if (!coupon) {
    throw new Error("Invalid or expired coupon code");
  }


  // Per-user coupon usage enforcement
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("Coupon usage limit reached");
  }
  if (coupon.perUserLimit) {
    const userId = (arguments[2] && typeof arguments[2] === 'number') ? arguments[2] : undefined;
    if (userId) {
      const [userUsage] = await db
        .select({ count: sql`COUNT(*)` })
        .from(sql.raw('coupon_usage'))
        .where(and(
          sql.raw('coupon_id = ?', [coupon.id]),
          sql.raw('user_id = ?', [userId])
        ));
      if (userUsage && userUsage.count >= coupon.perUserLimit) {
        throw new Error("You have already used this coupon");
      }
    }
  }

  if (coupon.minAmount && baseAmount < Number(coupon.minAmount)) {
    throw new Error(
      `Minimum order amount for this coupon is ₹${Number(
        coupon.minAmount
      ).toFixed(0)}`
    );
  }

  let discount = 0;
  if (coupon.discountType === "percent") {
    discount = (baseAmount * Number(coupon.discountValue)) / 100;
  } else {
    discount = Number(coupon.discountValue);
  }

  if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
    discount = Number(coupon.maxDiscount);
  }

  const finalAmount = Math.max(0, baseAmount - discount);

  return {
    finalAmount,
    appliedCoupon: { id: coupon.id, code: coupon.code },
  };
}

/**
 * POST /api/payment/course/:courseId/create-order
 * Body: { couponCode?: string }
 */
export const createCourseOrder = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = (req as any).userId as number | undefined;
    const courseId = Number(req.params.courseId);
    const { couponCode } = req.body as { couponCode?: string };

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    if (Number.isNaN(courseId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course ID" });
    }

    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!course || !course.isPublished || course.isFree) {
      return res.status(400).json({
        success: false,
        message: "Course not available for paid purchase",
      });
    }

    const baseAmount =
      course.discountPrice != null
        ? Number(course.discountPrice)
        : Number(course.originalPrice);

    if (!baseAmount || baseAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid course price",
      });
    }

    // Apply coupon if provided
    let finalAmount = baseAmount;
    let appliedCoupon: { id: number; code: string } | null = null;

    if (couponCode) {
      try {
        const result = await applyCoupon(baseAmount, couponCode);
        finalAmount = result.finalAmount;
        appliedCoupon = result.appliedCoupon;
      } catch (e: any) {
        return res.status(400).json({
          success: false,
          message: e.message || "Invalid coupon",
        });
      }
    }

    const amountPaise = Math.round(finalAmount * 100);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `course_${courseId}_user_${userId}_${Date.now()}`,
      notes: {
        courseId: String(courseId),
        userId: String(userId),
        couponCode: appliedCoupon?.code || "",
      },
    });

    const transactionId = `TXN_COURSE_${courseId}_${userId}_${Date.now()}`;

    await db.insert(payments).values({
      userId,
      courseId,
      orderId: order.id,
      transactionId,
      amount: finalAmount.toString(),
      currency: "INR",
      status: "pending",
      metadata: {
        courseId,
        baseAmount,
        finalAmount,
        couponId: appliedCoupon?.id || null,
        couponCode: appliedCoupon?.code || null,
      },
    });

    return res.status(201).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: finalAmount,
      currency: "INR",
      course: {
        id: course.id,
        title: course.title,
      },
      coupon: appliedCoupon,
    });
  } catch (error: any) {
    console.error("[CREATE COURSE ORDER ERROR]", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order. Please try again.",
    });
  }
};

/**
 * POST /api/payment/quiz/:quizId/create-order
 * Body: { couponCode?: string }
 */
export const createQuizOrder = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = (req as any).userId as number | undefined;
    const quizId = Number(req.params.quizId);
    const { couponCode } = req.body as { couponCode?: string };

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    if (Number.isNaN(quizId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid quiz ID" });
    }

    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    if (!quiz || !quiz.is_published) {
      return res.status(400).json({
        success: false,
        message: "Quiz not available for purchase",
      });
    }

    const baseAmount =
      quiz.discount_price != null
        ? Number(quiz.discount_price)
        : Number(quiz.price);

    if (!baseAmount || baseAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz price",
      });
    }

    // Apply coupon if provided
    let finalAmount = baseAmount;
    let appliedCoupon: { id: number; code: string } | null = null;

    if (couponCode) {
      try {
        const result = await applyCoupon(baseAmount, couponCode);
        finalAmount = result.finalAmount;
        appliedCoupon = result.appliedCoupon;
      } catch (e: any) {
        return res.status(400).json({
          success: false,
          message: e.message || "Invalid coupon",
        });
      }
    }

    const amountPaise = Math.round(finalAmount * 100);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `quiz_${quizId}_user_${userId}_${Date.now()}`,
      notes: {
        quizId: String(quizId),
        userId: String(userId),
        couponCode: appliedCoupon?.code || "",
      },
    });

    const transactionId = `TXN_QUIZ_${quizId}_${userId}_${Date.now()}`;

    await db.insert(payments).values({
      userId,
      quizId,
      orderId: order.id,
      transactionId,
      amount: finalAmount.toString(),
      currency: "INR",
      status: "pending",
      metadata: {
        quizId,
        baseAmount,
        finalAmount,
        couponId: appliedCoupon?.id || null,
        couponCode: appliedCoupon?.code || null,
      },
    });

    return res.status(201).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: finalAmount,
      currency: "INR",
      quiz: {
        id: quiz.id,
        title: quiz.title,
      },
      coupon: appliedCoupon,
    });
  } catch (error: any) {
    console.error("[CREATE QUIZ ORDER ERROR]", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order. Please try again.",
    });
  }
};

/**
 * POST /api/payment/study-material/:studyMaterialId/create-order
 * Body: { couponCode?: string }
 */
export const createStudyMaterialOrder = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = (req as any).userId as number | undefined;
    const studyMaterialId = Number(req.params.studyMaterialId);
    const { couponCode } = req.body as { couponCode?: string };

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    if (Number.isNaN(studyMaterialId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid study material ID" });
    }

    const [material] = await db
      .select()
      .from(studyMaterials)
      .where(eq(studyMaterials.id, studyMaterialId))
      .limit(1);

    if (!material || !material.isPublished || !material.isPaid) {
      return res.status(400).json({
        success: false,
        message: "Study material not available for purchase",
      });
    }

    // Check if already purchased
    const [existingPurchase] = await db
      .select()
      .from(studyMaterialPurchases)
      .where(
        and(
          eq(studyMaterialPurchases.userId, userId),
          eq(studyMaterialPurchases.studyMaterialId, studyMaterialId)
        )
      )
      .limit(1);

    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: "You have already purchased this material",
      });
    }

    const baseAmount =
      material.discountPrice != null
        ? Number(material.discountPrice)
        : Number(material.price);

    if (!baseAmount || baseAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid study material price",
      });
    }

    // Apply coupon if provided
    let finalAmount = baseAmount;
    let appliedCoupon: { id: number; code: string } | null = null;

    if (couponCode) {
      try {
        const result = await applyCoupon(baseAmount, couponCode);
        finalAmount = result.finalAmount;
        appliedCoupon = result.appliedCoupon;
      } catch (e: any) {
        return res.status(400).json({
          success: false,
          message: e.message || "Invalid coupon",
        });
      }
    }

    const amountPaise = Math.round(finalAmount * 100);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `study_material_${studyMaterialId}_user_${userId}_${Date.now()}`,
      notes: {
        studyMaterialId: String(studyMaterialId),
        userId: String(userId),
        couponCode: appliedCoupon?.code || "",
      },
    });

    const transactionId = `TXN_SM_${studyMaterialId}_${userId}_${Date.now()}`;

    await db.insert(payments).values({
      userId,
      studyMaterialId,
      orderId: order.id,
      transactionId,
      amount: finalAmount.toString(),
      currency: "INR",
      status: "pending",
      metadata: {
        studyMaterialId,
        baseAmount,
        finalAmount,
        couponId: appliedCoupon?.id || null,
        couponCode: appliedCoupon?.code || null,
      },
    });

    return res.status(201).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: finalAmount,
      currency: "INR",
      studyMaterial: {
        id: material.id,
        title: material.title,
      },
      coupon: appliedCoupon,
    });
  } catch (error: any) {
    console.error("[CREATE STUDY MATERIAL ORDER ERROR]", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order. Please try again.",
    });
  }
};

/**
 * POST /api/payment/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export const verifyPayment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = (req as any).userId as number | undefined;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    };

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Missing payment details" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await db
        .update(payments)
        .set({
          status: "failed",
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        })
        .where(eq(payments.orderId, razorpay_order_id));

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // ATOMIC TRANSACTION: payment status + access grants
    const result = await db.transaction(async (tx) => {
      const [paymentRecord] = await tx
        .select()
        .from(payments)
        .where(eq(payments.orderId, razorpay_order_id))
        .limit(1);

      if (!paymentRecord || paymentRecord.userId !== userId) {
        throw new Error("Payment record not found");
      }

      // Idempotency: already processed
      if (paymentRecord.status === "success") {
        return { success: true, message: "Payment already processed", isRetry: true };
      }
      if (paymentRecord.status === "failed") {
        throw new Error("This payment has been marked as failed");
      }

      await tx
        .update(payments)
        .set({
          status: "success",
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        })
        .where(eq(payments.id, paymentRecord.id));

      // Course access
      if (paymentRecord.courseId) {
        const [existingEnrollment] = await tx
          .select()
          .from(enrollments)
          .where(
            and(
              eq(enrollments.userId, userId),
              eq(enrollments.courseId, paymentRecord.courseId)
            )
          )
          .limit(1);

        if (!existingEnrollment) {
          await tx.insert(enrollments).values({
            userId,
            courseId: paymentRecord.courseId,
            progress: 0,
            completedLessons: 0,
          });
        }
      }

      // Quiz access
      if (paymentRecord.quizId) {
        const [existingAccess] = await tx
          .select()
          .from(quiz_access)
          .where(
            and(
              eq(quiz_access.userId, userId),
              eq(quiz_access.quizId, paymentRecord.quizId)
            )
          )
          .limit(1);

        if (!existingAccess) {
          await tx.insert(quiz_access).values({
            userId,
            quizId: paymentRecord.quizId,
          });
        }
      }

      // Study material access
      if (paymentRecord.studyMaterialId) {
        const [existingPurchase] = await tx
          .select()
          .from(studyMaterialPurchases)
          .where(
            and(
              eq(studyMaterialPurchases.userId, userId),
            eq(
              studyMaterialPurchases.studyMaterialId,
              paymentRecord.studyMaterialId
            )
          )
        )
        .limit(1);

      if (!existingPurchase[0]) {
        await db.insert(studyMaterialPurchases).values({
          userId,
          studyMaterialId: paymentRecord.studyMaterialId,
          paymentId: paymentRecord.id,
          purchasePrice: paymentRecord.amount,
        });
      }
    }

    return res.json({
      success: true,
      message: "Payment verified and access granted.",
    });
  } catch (error: any) {
    console.error("[VERIFY PAYMENT ERROR]", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment. Please contact support.",
    });
  }
};
