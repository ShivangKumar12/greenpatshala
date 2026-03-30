// client/src/services/studyMaterialsApi.ts - PRODUCTION READY WITH PURCHASE TRACKING
import apiClient from '@/lib/axios';

// ============================================
// TYPES
// ============================================

export interface StudyMaterialPayload {
  title: string;
  description?: string;
  subject: string;
  category: string;
  fileType: 'pdf' | 'doc' | 'video' | 'link';
  fileUrl?: string;
  fileSize?: number;
  totalPages?: number;
  thumbnail?: string;
  courseId?: number;
  isPaid: boolean;
  price?: number;
  discountPrice?: number;
  isPublished?: boolean;
}

export interface StudyMaterial extends StudyMaterialPayload {
  id: number;
  views: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
}

export interface StudyMaterialsFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subject?: string;
  fileType?: string;
  isFree?: boolean;
  status?: 'published' | 'draft' | 'free' | 'paid' | 'all';
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  success: boolean;
  items?: T[];
  materials?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  materialId?: number;
  isPublished?: boolean;
}

// ============================================
// PUBLIC ENDPOINTS
// ============================================

/**
 * Get paginated list of published study materials
 */
export const getStudyMaterials = async (
  filters: StudyMaterialsFilters = {},
): Promise<PaginatedResponse<StudyMaterial>> => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.subject) params.append('subject', filters.subject);
  if (filters.fileType) params.append('fileType', filters.fileType);
  
  if (filters.isFree === true) {
    params.append('isFree', 'true');
  } else if (filters.isFree === false) {
    params.append('isFree', 'false');
  }

  const query = params.toString();
  const { data } = await apiClient.get<PaginatedResponse<StudyMaterial>>(
    `/study-materials${query ? `?${query}` : ''}`
  );
  
  return data;
};

/**
 * Get single study material by ID
 */
export const getStudyMaterial = async (
  id: number,
): Promise<{ success: boolean; item: StudyMaterial }> => {
  const { data } = await apiClient.get<{ success: boolean; item: StudyMaterial }>(
    `/study-materials/${id}`
  );
  return data;
};

/**
 * Increment download counter for a study material
 */
export const incrementDownload = async (
  id: number,
): Promise<{ success: boolean }> => {
  const { data } = await apiClient.post<{ success: boolean }>(
    `/study-materials/${id}/download`
  );
  return data;
};

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * Get all study materials with admin filters (includes unpublished)
 */
export const getAdminStudyMaterials = async (
  filters: StudyMaterialsFilters = {},
): Promise<PaginatedResponse<StudyMaterial>> => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.search) params.append('search', filters.search);
  if (filters.category && filters.category !== 'all') {
    params.append('category', filters.category);
  }
  if (filters.subject && filters.subject !== 'all') {
    params.append('subject', filters.subject);
  }
  if (filters.status && filters.status !== 'all') {
    params.append('status', filters.status);
  }
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const query = params.toString();
  const { data } = await apiClient.get<PaginatedResponse<StudyMaterial>>(
    `/study-materials/admin/list${query ? `?${query}` : ''}`
  );
  
  return data;
};

/**
 * Create new study material with PDF upload
 */
export const createStudyMaterial = async (
  formData: FormData,
): Promise<ApiResponse> => {
  const { data } = await apiClient.post<ApiResponse>(
    '/study-materials/admin',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return data;
};

/**
 * Update study material (supports optional PDF replacement)
 */
export const updateStudyMaterial = async (
  id: number,
  payload: Partial<StudyMaterialPayload> | FormData,
): Promise<ApiResponse> => {
  const isFormData = payload instanceof FormData;
  
  const config = isFormData
    ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    : undefined;

  const { data } = await apiClient.put<ApiResponse>(
    `/study-materials/admin/${id}`,
    payload,
    config
  );
  
  return data;
};

/**
 * Delete study material and associated file
 */
export const deleteStudyMaterial = async (
  id: number,
): Promise<ApiResponse> => {
  const { data } = await apiClient.delete<ApiResponse>(
    `/study-materials/admin/${id}`
  );
  return data;
};

/**
 * Toggle publish/unpublish status of study material
 */
export const togglePublishStudyMaterial = async (
  id: number,
): Promise<ApiResponse> => {
  const { data } = await apiClient.patch<ApiResponse>(
    `/study-materials/admin/${id}/toggle-publish`
  );
  return data;
};

// ============================================
// USER PURCHASE ENDPOINTS
// ============================================

/**
 * Get list of study material IDs that the user has purchased
 * @returns Array of purchased material IDs
 */
export const getUserPurchasedMaterialIds = async (): Promise<number[]> => {
  try {
    const { data } = await apiClient.get<{
      success: boolean;
      materials: Array<{ studyMaterialId: number }>;
    }>('/study-materials/purchased');
    
    return data.materials?.map((m) => m.studyMaterialId) || [];
  } catch (error: any) {
    // If user not logged in, return empty array
    if (error.response?.status === 401) {
      return [];
    }
    throw error;
  }
};

/**
 * Get full details of purchased study materials
 * @returns Array of purchased materials with details
 */
export const getUserPurchasedMaterials = async (): Promise<{
  success: boolean;
  materials: Array<{
    id: number;
    studyMaterialId: number;
    purchaseDate: string;
    title: string;
    subject: string;
    category: string;
    fileType: string;
    fileUrl: string | null;
    fileSize: number | null;
    totalPages: number | null;
    thumbnail: string | null;
  }>;
}> => {
  const { data } = await apiClient.get('/study-materials/purchased');
  return data;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build FormData for study material creation/update
 */
export const buildStudyMaterialFormData = (
  material: {
    title: string;
    description: string;
    category: string;
    subject: string;
    isFree: boolean;
    price?: string;
    discountPrice?: string;
  },
  file?: File | null,
): FormData => {
  const formData = new FormData();
  
  formData.append('title', material.title);
  formData.append('description', material.description);
  formData.append('category', material.category);
  formData.append('subject', material.subject);
  formData.append('isFree', material.isFree.toString());
  
  if (!material.isFree) {
    if (material.price) {
      formData.append('price', material.price);
    }
    if (material.discountPrice) {
      formData.append('discountPrice', material.discountPrice);
    }
  }
  
  if (file) {
    formData.append('file', file);
  }
  
  return formData;
};

/**
 * Validate study material form data
 */
export const validateStudyMaterial = (
  material: {
    title: string;
    description: string;
    category: string;
    subject: string;
    isFree: boolean;
    price?: string;
  },
  requireFile: boolean = false,
): { valid: boolean; error?: string } => {
  if (!material.title?.trim()) {
    return { valid: false, error: 'Title is required' };
  }
  
  if (!material.category?.trim()) {
    return { valid: false, error: 'Category is required' };
  }
  
  if (!material.subject?.trim()) {
    return { valid: false, error: 'Subject is required' };
  }
  
  if (!material.isFree) {
    const price = parseFloat(material.price || '0');
    if (price <= 0) {
      return { valid: false, error: 'Price must be greater than 0 for paid materials' };
    }
  }
  
  return { valid: true };
};

/**
 * Format file size to human-readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Get file URL for download/preview
 */
export const getFileUrl = (fileUrl: string): string => {
  if (fileUrl.startsWith('http')) {
    return fileUrl;
  }
  return `${window.location.origin}${fileUrl}`;
};
