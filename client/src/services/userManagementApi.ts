// client/src/services/userManagementApi.ts - PRODUCTION READY + CREATE USER
import apiClient from '@/lib/axios';

// ============================================
// TYPES
// ============================================

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'instructor' | 'admin';
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  stats: {
    coursesEnrolled: number;
    quizzesAttempted: number;
    totalSpent: number;
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  instructors: number;
  admins: number;
}

export interface UsersResponse {
  success: boolean;
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: UserStats;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'all' | 'user' | 'instructor' | 'admin';
  status?: 'all' | 'active' | 'suspended';
}

export interface ApiResponse {
  success: boolean;
  message: string;
  isActive?: boolean;
  userId?: number;
}

// ✅ NEW - Create user data type
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'user' | 'instructor' | 'admin';
  isVerified: boolean;
  isActive: boolean;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get all users with filters, pagination, and stats
 * @param filters - Search, filter, and pagination options
 * @returns Users list with stats
 */
export const getUsers = async (filters: UserFilters = {}): Promise<UsersResponse> => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.search) params.append('search', filters.search);
  if (filters.role && filters.role !== 'all') params.append('role', filters.role);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);

  const query = params.toString();
  const { data } = await apiClient.get<UsersResponse>(`/admin/users${query ? `?${query}` : ''}`);
  
  return data;
};

/**
 * ✅ FIXED - Create user manually (Admin only)
 * @param userData - User data for creation
 * @returns Success response with user ID
 */
export const createUser = async (userData: CreateUserData): Promise<ApiResponse> => {
  const { data } = await apiClient.post<ApiResponse>('/admin/users/create', userData);
  return data;
};

/**
 * Update user role
 * @param userId - User ID
 * @param role - New role (user/instructor/admin)
 * @returns Success response
 */
export const updateUserRole = async (
  userId: number,
  role: 'user' | 'instructor' | 'admin'
): Promise<ApiResponse> => {
  const { data } = await apiClient.patch<ApiResponse>(`/admin/users/${userId}/role`, { role });
  return data;
};

/**
 * Toggle user active status (suspend/activate)
 * @param userId - User ID
 * @returns Success response with new status
 */
export const toggleUserStatus = async (userId: number): Promise<ApiResponse> => {
  const { data } = await apiClient.patch<ApiResponse>(`/admin/users/${userId}/status`);
  return data;
};

/**
 * Delete user permanently
 * @param userId - User ID
 * @returns Success response
 */
export const deleteUser = async (userId: number): Promise<ApiResponse> => {
  const { data } = await apiClient.delete<ApiResponse>(`/admin/users/${userId}`);
  return data;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get role display name
 * @param role - User role
 * @returns Display name
 */
export const getRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    user: 'User',
    instructor: 'Instructor',
    admin: 'Admin',
  };
  return roleMap[role] || role;
};

/**
 * Get role color for badges
 * @param role - User role
 * @returns Tailwind CSS classes
 */
export const getRoleBadgeColor = (role: string): string => {
  const colorMap: Record<string, string> = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    instructor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    user: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  };
  return colorMap[role] || colorMap.user;
};

/**
 * Get status badge color
 * @param isActive - User active status
 * @returns Tailwind CSS classes
 */
export const getStatusBadgeColor = (isActive: boolean): string => {
  return isActive
    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
};

/**
 * Format user stats for display
 * @param stats - User stats
 * @returns Formatted stats array
 */
export const formatUserStats = (stats: User['stats']) => {
  return [
    {
      label: 'Courses Enrolled',
      value: stats.coursesEnrolled,
      icon: 'BookOpen',
    },
    {
      label: 'Quizzes Attempted',
      value: stats.quizzesAttempted,
      icon: 'Brain',
    },
    {
      label: 'Total Spent',
      value: `₹${stats.totalSpent.toLocaleString()}`,
      icon: 'IndianRupee',
      hide: stats.totalSpent === 0,
    },
  ];
};

/**
 * ✅ NEW - Validate email format
 * @param email - Email address
 * @returns True if valid
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * ✅ NEW - Validate password strength
 * @param password - Password string
 * @returns Error message or null if valid
 */
export const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

/**
 * ✅ NEW - Validate phone number format
 * @param phone - Phone number string
 * @returns True if valid or empty
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone || !phone.trim()) return true; // Optional field
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

