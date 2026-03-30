// server/controllers/couponController.ts - PRODUCTION READY
import { Request, Response } from 'express';
import { invalidateCache } from '../middleware/cacheMiddleware';
import { db } from '../config/db';
import { coupons } from '../../shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

/**
 * Get all coupons (ADMIN)
 * GET /api/admin/coupons
 */
export const getAllCoupons = async (req: Request, res: Response): Promise<Response> => {
  try {
    const allCoupons = await db
      .select()
      .from(coupons)
      .orderBy(desc(coupons.createdAt));

    return res.json({
      success: true,
      coupons: allCoupons,
      count: allCoupons.length,
    });
  } catch (error: any) {
    console.error('❌ [GET ALL COUPONS ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons',
      coupons: [],
    });
  }
};

/**
 * Get coupon by ID (ADMIN)
 * GET /api/admin/coupons/:id
 */
export const getCouponById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coupon ID',
      });
    }

    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, Number(id)));

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    return res.json({
      success: true,
      coupon,
    });
  } catch (error: any) {
    console.error('❌ [GET COUPON BY ID ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch coupon',
    });
  }
};

/**
 * Create coupon (ADMIN)
 * POST /api/admin/coupons
 */
export const createCoupon = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minAmount,
      maxDiscount,
      usageLimit,
      validFrom,
      validUntil,
      isActive,
    } = req.body;

    // Validation
    if (!code || !discountType || !discountValue || !validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Code, discount type, discount value, and valid until are required',
      });
    }

    if (!['percentage', 'fixed'].includes(discountType)) {
      return res.status(400).json({
        success: false,
        message: 'Discount type must be percentage or fixed',
      });
    }

    if (discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Discount value must be greater than 0',
      });
    }

    if (discountType === 'percentage' && discountValue > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount cannot exceed 100%',
      });
    }

    // Check if code already exists
    const [existingCoupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code.toUpperCase()));

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists',
      });
    }

    // Create coupon
    const [newCoupon] = await db.insert(coupons).values({
      code: code.toUpperCase(),
      description: description || '',
      discountType,
      discountValue: Number(discountValue),
      minAmount: minAmount ? Number(minAmount) : null,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      usedCount: 0,
      validFrom: validFrom || new Date().toISOString(),
      validUntil,
      isActive: isActive !== undefined ? isActive : true,
    });

    console.log('✅ [COUPON CREATED]', { id: newCoupon.insertId, code: code.toUpperCase() });

    await invalidateCache('api_cache:GET:/api/admin/coupons*', 'api_cache:GET:/api/coupons*');
    return res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon: { id: newCoupon.insertId },
    });
  } catch (error: any) {
    console.error('❌ [CREATE COUPON ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create coupon',
    });
  }
};

/**
 * Update coupon (ADMIN)
 * PUT /api/admin/coupons/:id
 */
export const updateCoupon = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const {
      code,
      description,
      discountType,
      discountValue,
      minAmount,
      maxDiscount,
      usageLimit,
      validFrom,
      validUntil,
      isActive,
    } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coupon ID',
      });
    }

    // Check if coupon exists
    const [existingCoupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, Number(id)));

    if (!existingCoupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    // Check if new code conflicts with another coupon
    if (code && code.toUpperCase() !== existingCoupon.code) {
      const [codeExists] = await db
        .select()
        .from(coupons)
        .where(and(eq(coupons.code, code.toUpperCase()), sql`${coupons.id} != ${Number(id)}`));

      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists',
        });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (code) updateData.code = code.toUpperCase();
    if (description !== undefined) updateData.description = description;
    if (discountType) updateData.discountType = discountType;
    if (discountValue) updateData.discountValue = Number(discountValue);
    if (minAmount !== undefined) updateData.minAmount = minAmount ? Number(minAmount) : null;
    if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount ? Number(maxDiscount) : null;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit ? Number(usageLimit) : null;
    if (validFrom) updateData.validFrom = validFrom;
    if (validUntil) updateData.validUntil = validUntil;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No update data provided',
      });
    }

    await db.update(coupons).set(updateData).where(eq(coupons.id, Number(id)));

    console.log('✅ [COUPON UPDATED]', { id, ...updateData });

    await invalidateCache('api_cache:GET:/api/admin/coupons*', 'api_cache:GET:/api/coupons*');
    return res.json({
      success: true,
      message: 'Coupon updated successfully',
    });
  } catch (error: any) {
    console.error('❌ [UPDATE COUPON ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update coupon',
    });
  }
};

/**
 * Toggle coupon active status (ADMIN)
 * PATCH /api/admin/coupons/:id/toggle
 */
export const toggleCouponStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coupon ID',
      });
    }

    await db.update(coupons).set({ isActive }).where(eq(coupons.id, Number(id)));

    console.log('✅ [COUPON STATUS TOGGLED]', { id, isActive });

    await invalidateCache('api_cache:GET:/api/admin/coupons*', 'api_cache:GET:/api/coupons*');
    return res.json({
      success: true,
      message: `Coupon ${isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error: any) {
    console.error('❌ [TOGGLE COUPON STATUS ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle coupon status',
    });
  }
};

/**
 * Delete coupon (ADMIN)
 * DELETE /api/admin/coupons/:id
 */
export const deleteCoupon = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coupon ID',
      });
    }

    await db.delete(coupons).where(eq(coupons.id, Number(id)));

    console.log('✅ [COUPON DELETED]', { id });

    await invalidateCache('api_cache:GET:/api/admin/coupons*', 'api_cache:GET:/api/coupons*');
    return res.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error: any) {
    console.error('❌ [DELETE COUPON ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete coupon',
    });
  }
};

/**
 * Validate and apply coupon (PUBLIC)
 * POST /api/coupons/validate
 */
export const validateCoupon = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { code, amount } = req.body;

    if (!code || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and amount are required',
      });
    }

    // Find coupon
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code.toUpperCase()));

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code',
      });
    }

    // Validate coupon
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is not active',
      });
    }

    if (now < validFrom) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is not yet valid',
      });
    }

    if (now > validUntil) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has expired',
      });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has reached its usage limit',
      });
    }

    if (coupon.minAmount && Number(amount) < Number(coupon.minAmount)) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase amount is ₹${coupon.minAmount}`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (Number(amount) * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount);
      }
    } else {
      discount = Number(coupon.discountValue);
    }

    const finalAmount = Math.max(0, Number(amount) - discount);

    return res.json({
      success: true,
      message: 'Coupon applied successfully',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount: Math.round(discount * 100) / 100,
      originalAmount: Number(amount),
      finalAmount: Math.round(finalAmount * 100) / 100,
    });
  } catch (error: any) {
    console.error('❌ [VALIDATE COUPON ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to validate coupon',
    });
  }
};

/**
 * Increment coupon usage count (INTERNAL)
 */
export const incrementCouponUsage = async (couponCode: string) => {
  try {
    await db
      .update(coupons)
      .set({ usedCount: sql`${coupons.usedCount} + 1` })
      .where(eq(coupons.code, couponCode.toUpperCase()));
  } catch (error) {
    console.error('❌ [INCREMENT COUPON USAGE ERROR]', error);
  }
};
