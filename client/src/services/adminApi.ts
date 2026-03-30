// client/src/services/adminApi.ts - FIXED VERSION
import apiClient from '@/lib/axios';  // ✅ CHANGED from @/lib/api

export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalQuizzes: number;
  totalRevenue: number;
  activeJobs: number;
  studyMaterials: number;
  currentAffairs: number;
  recentPayments: number;
  totalPayments: number;
  pendingPayments: number;
  totalFeedback: number;
  successStories: number;
  totalCoupons: number;
  activeCoupons: number;
}

export interface RevenueHistory {
  name: string;
  value: number;
}

export interface UserGrowth {
  name: string;
  users: number;
}

export interface AdminStatsResponse {
  success: boolean;
  stats: DashboardStats;
  revenueHistory?: RevenueHistory[];
  userGrowth?: UserGrowth[];
}
export interface RecentPayment {
  id: number;
  user: string;
  item: string;
  amount: number;
  date: string;
  status: string;
}

export const getAdminStats = async () => {
  const response = await apiClient.get('/admin/stats');
  return response.data;
};

export const getRecentPayments = async (limit = 5) => {
  const response = await apiClient.get(`/admin/payments/recent?limit=${limit}`);
  return response.data;
};

export interface EnrollmentTrend {
  name: string;
  enrollments: number;
}

export const getChartData = async () => {
  const response = await apiClient.get('/admin/charts');
  return response.data;
};
