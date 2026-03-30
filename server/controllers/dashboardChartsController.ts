// server/controllers/dashboardChartsController.ts
// Separate controller for dashboard chart time-series data
import { Request, Response } from 'express';
import { db } from '../config/db';
import { sql } from 'drizzle-orm';

// ============================================
// GET DASHBOARD CHART DATA (ADMIN ONLY)
// Revenue by month (last 6 months) + User registrations by day (last 7 days)
// ============================================
export const getDashboardChartData = async (req: Request, res: Response) => {
    try {
        // 1. Revenue Growth (Last 6 Months)
        // Uses actual MySQL column name: created_at
        const revenueHistoryRaw = await db.execute(sql`
      SELECT 
        DATE_FORMAT(created_at, '%b') as name,
        COALESCE(SUM(amount), 0) as value
      FROM payments
      WHERE status = 'success'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at), DATE_FORMAT(created_at, '%b')
      ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC
      LIMIT 6
    `);

        // mysql2 returns [rows, fields] — extract the rows array
        const revenueRows = Array.isArray(revenueHistoryRaw) && revenueHistoryRaw.length > 0 && Array.isArray(revenueHistoryRaw[0])
            ? revenueHistoryRaw[0]
            : revenueHistoryRaw;

        const revenueHistory = (revenueRows as any[]).map((row: any) => ({
            name: String(row.name || ''),
            value: Number(row.value || 0),
        }));

        // 2. User Growth (Last 7 Days)
        // Uses actual MySQL column name: created_at
        const userGrowthRaw = await db.execute(sql`
      SELECT 
        DATE_FORMAT(created_at, '%a') as name,
        COUNT(*) as users
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%a')
      ORDER BY DATE(created_at) ASC
      LIMIT 7
    `);

        const userRows = Array.isArray(userGrowthRaw) && userGrowthRaw.length > 0 && Array.isArray(userGrowthRaw[0])
            ? userGrowthRaw[0]
            : userGrowthRaw;

        const userGrowth = (userRows as any[]).map((row: any) => ({
            name: String(row.name || ''),
            users: Number(row.users || 0),
        }));

        // 3. Enrollment trend (last 6 months)
        const enrollmentTrendRaw = await db.execute(sql`
      SELECT 
        DATE_FORMAT(created_at, '%b') as name,
        COUNT(*) as enrollments
      FROM enrollments
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at), DATE_FORMAT(created_at, '%b')
      ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC
      LIMIT 6
    `);

        const enrollmentRows = Array.isArray(enrollmentTrendRaw) && enrollmentTrendRaw.length > 0 && Array.isArray(enrollmentTrendRaw[0])
            ? enrollmentTrendRaw[0]
            : enrollmentTrendRaw;

        const enrollmentTrend = (enrollmentRows as any[]).map((row: any) => ({
            name: String(row.name || ''),
            enrollments: Number(row.enrollments || 0),
        }));

        return res.json({
            success: true,
            revenueHistory,
            userGrowth,
            enrollmentTrend,
        });
    } catch (error: any) {
        console.error('❌ [DASHBOARD CHARTS ERROR]', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch chart data',
        });
    }
};
