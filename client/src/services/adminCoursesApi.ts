// client/src/services/adminCoursesApi.ts

import apiClient from '@/lib/axios';

// --- Types ---

export interface AdminCourse {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  instructorId: number;
  category: string;
  level: string;
  duration: string;
  language: string;
  originalPrice: number;
  discountPrice: number | null;
  isFree: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  totalLessons: number;
  totalStudents: number;
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
  syllabus?: any[];
  features?: any[];
  requirements?: any[];
}

export interface Lesson {
  id: number;
  moduleId: number;
  courseId: number;
  title: string;
  description: string | null;
  contentType: 'video' | 'pdf' | 'text' | 'quiz';
  videoUrl: string | null;
  pdfUrl: string | null;
  textContent: string | null;
  duration: number | null;
  orderIndex: number;
  isFree: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseData {
  title: string;
  description: string;
  thumbnail?: string | null;
  category: string;
  level: string;
  duration: string;
  language: string;
  originalPrice: number;
  discountPrice: number | null;
  isFree: boolean;
  isFeatured: boolean;
  totalLessons?: number;
  totalReviews?: number;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  isPublished?: boolean;
}

// ✅ NEW - Pricing Update Data
export interface PricingUpdateData {
  originalPrice: number;
  discountPrice?: number | null;
  isFree: boolean;
}

// ✅ NEW - Quick Update Data
export interface QuickUpdateData {
  field: 'originalPrice' | 'discountPrice' | 'isFree' | 'isFeatured' | 'isPublished' | 'thumbnail';
  value: any;
}

export interface CoursesResponse {
  success: boolean;
  courses: AdminCourse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleCourseResponse {
  success: boolean;
  course: AdminCourse;
  message?: string;
}

export interface CourseFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CourseLessonsResponse {
  success: boolean;
  data: Lesson[];
  message?: string;
}

export interface UploadContentResponse {
  success: boolean;
  message: string;
  data: Lesson[];
}

export interface DeleteLessonResponse {
  success: boolean;
  message: string;
}

export interface CourseStatistics {
  totalStudents: number;
  totalLessons: number;
  rating: number;
  totalReviews: number;
  totalPdfs: number;
  totalVideos: number;
  isPublished: boolean;
  isFeatured: boolean;
  isFree: boolean;
  revenue: number;
}

export interface StatisticsResponse {
  success: boolean;
  statistics: CourseStatistics;
}

// --- API Methods ---

/**
 * Get all courses with advanced filtering and pagination
 */
export const getAdminCourses = async (filters: CourseFilters = {}): Promise<CoursesResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get(`/admin/courses?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('[GET ADMIN COURSES ERROR]', error);
    throw error;
  }
};

/**
 * Get a single course by ID
 */
export const getCourseById = async (id: number): Promise<SingleCourseResponse> => {
  try {
    const response = await apiClient.get(`/admin/courses/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('[GET COURSE BY ID ERROR]', error);
    throw error;
  }
};

/**
 * Create a new course
 */
export const createCourse = async (courseData: CreateCourseData): Promise<SingleCourseResponse> => {
  try {
    const payload = {
      ...courseData,
      originalPrice: Number(courseData.originalPrice) || 0,
      discountPrice: courseData.discountPrice ? Number(courseData.discountPrice) : null,
      totalLessons: Number(courseData.totalLessons) || 0,
      totalReviews: Number(courseData.totalReviews) || 0,
    };

    const response = await apiClient.post('/admin/courses', payload);
    return response.data;
  } catch (error: any) {
    console.error('[CREATE COURSE ERROR]', error);
    throw error;
  }
};

/**
 * Update an existing course
 */
/**
 * Update an existing course - Supports both JSON and FormData (for thumbnail uploads)
 */
export const updateCourse = async (id: number, courseData: UpdateCourseData | FormData): Promise<SingleCourseResponse> => {
  try {
    // ✅ Check if it's FormData (with file upload)
    if (courseData instanceof FormData) {
      console.log('[UPDATE COURSE] Sending FormData with thumbnail file');
      const response = await apiClient.put(`/admin/courses/${id}`, courseData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // ✅ Regular JSON update (no file)
    console.log('[UPDATE COURSE] Sending JSON data (no file)');
    const payload = {
      ...courseData,
      originalPrice: courseData.originalPrice !== undefined ? Number(courseData.originalPrice) : undefined,
      discountPrice: courseData.discountPrice !== undefined ? (courseData.discountPrice ? Number(courseData.discountPrice) : null) : undefined,
      totalLessons: courseData.totalLessons !== undefined ? Number(courseData.totalLessons) : undefined,
      totalReviews: courseData.totalReviews !== undefined ? Number(courseData.totalReviews) : undefined,
    };

    const response = await apiClient.put(`/admin/courses/${id}`, payload);
    return response.data;
  } catch (error: any) {
    console.error('[UPDATE COURSE ERROR]', error);
    throw error;
  }
};


/**
 * Delete a course
 */
export const deleteCourse = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.delete(`/admin/courses/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('[DELETE COURSE ERROR]', error);
    throw error;
  }
};

/**
 * Toggle Publish Status
 */
export const togglePublish = async (id: number): Promise<SingleCourseResponse> => {
  try {
    const response = await apiClient.patch(`/admin/courses/${id}/toggle-publish`);
    return response.data;
  } catch (error: any) {
    console.error('[TOGGLE PUBLISH ERROR]', error);
    throw error;
  }
};

/**
 * ✅ NEW - Toggle Featured Status
 */
export const toggleFeatured = async (id: number): Promise<SingleCourseResponse> => {
  try {
    const response = await apiClient.patch(`/admin/courses/${id}/toggle-featured`);
    return response.data;
  } catch (error: any) {
    console.error('[TOGGLE FEATURED ERROR]', error);
    throw error;
  }
};

/**
 * ✅ NEW - Toggle Free Status
 */
export const toggleFree = async (id: number): Promise<SingleCourseResponse> => {
  try {
    const response = await apiClient.patch(`/admin/courses/${id}/toggle-free`);
    return response.data;
  } catch (error: any) {
    console.error('[TOGGLE FREE ERROR]', error);
    throw error;
  }
};

/**
 * ✅ NEW - Update Course Pricing
 */
export const updateCoursePricing = async (
  id: number, 
  pricingData: PricingUpdateData
): Promise<SingleCourseResponse> => {
  try {
    const payload = {
      originalPrice: Number(pricingData.originalPrice) || 0,
      discountPrice: pricingData.discountPrice ? Number(pricingData.discountPrice) : null,
      isFree: Boolean(pricingData.isFree),
    };

    const response = await apiClient.patch(`/admin/courses/${id}/pricing`, payload);
    return response.data;
  } catch (error: any) {
    console.error('[UPDATE PRICING ERROR]', error);
    throw error;
  }
};

/**
 * ✅ NEW - Quick Update Single Field
 */
export const quickUpdateCourse = async (
  id: number, 
  updateData: QuickUpdateData
): Promise<SingleCourseResponse> => {
  try {
    const response = await apiClient.patch(`/admin/courses/${id}/quick-update`, updateData);
    return response.data;
  } catch (error: any) {
    console.error('[QUICK UPDATE ERROR]', error);
    throw error;
  }
};

/**
 * Upload Course Content (Creates Lessons)
 */
export const uploadCourseContent = async (
  courseId: number, 
  formData: FormData, 
  onUploadProgress?: (progressEvent: any) => void
): Promise<UploadContentResponse> => {
  try {
    const response = await apiClient.post(`/admin/courses/${courseId}/content/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  } catch (error: any) {
    console.error('[UPLOAD CONTENT ERROR]', error);
    throw error;
  }
};

/**
 * Get Course Lessons
 */
export const getCourseLessons = async (courseId: number): Promise<CourseLessonsResponse> => {
  try {
    const response = await apiClient.get(`/admin/courses/${courseId}/lessons`);
    return response.data;
  } catch (error: any) {
    console.error('[GET COURSE LESSONS ERROR]', error);
    throw error;
  }
};

/**
 * Delete a specific lesson
 */
export const deleteLesson = async (
  courseId: number, 
  lessonId: number
): Promise<DeleteLessonResponse> => {
  try {
    const response = await apiClient.delete(`/admin/courses/${courseId}/lessons/${lessonId}`);
    return response.data;
  } catch (error: any) {
    console.error('[DELETE LESSON ERROR]', error);
    throw error;
  }
};

/**
 * Get course statistics
 */
export const getCourseStatistics = async (courseId: number): Promise<StatisticsResponse> => {
  try {
    const response = await apiClient.get(`/admin/courses/${courseId}/statistics`);
    return response.data;
  } catch (error: any) {
    console.error('[GET COURSE STATISTICS ERROR]', error);
    throw error;
  }
};

/**
 * Batch upload multiple files with progress tracking
 */
export const batchUploadContent = async (
  courseId: number,
  files: { pdfs: File[]; videos: File[] },
  onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void
): Promise<UploadContentResponse> => {
  try {
    const formData = new FormData();
    
    // Append PDF files
    files.pdfs.forEach((file) => {
      formData.append('pdfs', file);
    });
    
    // Append video files
    files.videos.forEach((file) => {
      formData.append('videos', file);
    });

    const response = await apiClient.post(`/admin/courses/${courseId}/content/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage,
          });
        }
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('[BATCH UPLOAD ERROR]', error);
    throw error;
  }
};

/**
 * ✅ NEW - Bulk Update Multiple Courses
 */
export const bulkUpdateCourses = async (
  courseIds: number[],
  updates: Partial<UpdateCourseData>
): Promise<{ success: boolean; message: string; updatedCount: number }> => {
  try {
    const response = await apiClient.patch('/admin/courses/bulk-update', {
      courseIds,
      updates,
    });
    return response.data;
  } catch (error: any) {
    console.error('[BULK UPDATE ERROR]', error);
    throw error;
  }
};

/**
 * ✅ NEW - Bulk Delete Courses
 */
export const bulkDeleteCourses = async (
  courseIds: number[]
): Promise<{ success: boolean; message: string; deletedCount: number }> => {
  try {
    const response = await apiClient.post('/admin/courses/bulk-delete', { courseIds });
    return response.data;
  } catch (error: any) {
    console.error('[BULK DELETE ERROR]', error);
    throw error;
  }
};

/**
 * ✅ NEW - Duplicate a course
 */
export const duplicateCourse = async (id: number): Promise<SingleCourseResponse> => {
  try {
    const response = await apiClient.post(`/admin/courses/${id}/duplicate`);
    return response.data;
  } catch (error: any) {
    console.error('[DUPLICATE COURSE ERROR]', error);
    throw error;
  }
};

/**
 * ✅ NEW - Export courses to CSV
 */
export const exportCoursesToCSV = async (filters?: CourseFilters): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);

    const response = await apiClient.get(`/admin/courses/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error: any) {
    console.error('[EXPORT COURSES ERROR]', error);
    throw error;
  }
};

/**
 * ✅ NEW - Get course analytics
 */
export const getCourseAnalytics = async (courseId: number, period: 'week' | 'month' | 'year' = 'month') => {
  try {
    const response = await apiClient.get(`/admin/courses/${courseId}/analytics?period=${period}`);
    return response.data;
  } catch (error: any) {
    console.error('[GET COURSE ANALYTICS ERROR]', error);
    throw error;
  }
};

// --- Helper Functions ---

/**
 * Format price for display
 */
export const formatPrice = (price: number | null, isFree: boolean = false): string => {
  if (isFree) return 'FREE';
  if (!price) return '₹0.00';
  return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (originalPrice: number, discountPrice: number | null): number => {
  if (!discountPrice || discountPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
};

/**
 * Validate course data before submission
 */
export const validateCourseData = (data: CreateCourseData | UpdateCourseData): { 
  valid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];

  if ('title' in data && !data.title?.trim()) {
    errors.push('Title is required');
  }

  if ('description' in data && !data.description?.trim()) {
    errors.push('Description is required');
  }

  if ('category' in data && !data.category?.trim()) {
    errors.push('Category is required');
  }

  if ('originalPrice' in data && data.originalPrice !== undefined) {
    const price = Number(data.originalPrice);
    if (isNaN(price) || price < 0) {
      errors.push('Original price must be a valid number');
    }
  }

  if ('discountPrice' in data && data.discountPrice !== null && data.discountPrice !== undefined) {
    const discount = Number(data.discountPrice);
    const original = Number(data.originalPrice || 0);
    
    if (isNaN(discount) || discount < 0) {
      errors.push('Discount price must be a valid number');
    } else if (discount > original) {
      errors.push('Discount price cannot be greater than original price');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get course status badge variant
 */
export const getCourseStatusVariant = (isPublished: boolean): 'default' | 'secondary' => {
  return isPublished ? 'default' : 'secondary';
};

/**
 * Get content type icon
 */
export const getContentTypeIcon = (contentType: string): string => {
  const icons: { [key: string]: string } = {
    'pdf': '📄',
    'video': '🎥',
    'text': '📝',
    'quiz': '❓',
  };
  return icons[contentType] || '📁';
};

