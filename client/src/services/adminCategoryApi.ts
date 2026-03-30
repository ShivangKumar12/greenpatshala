// client/src/services/adminCategoryApi.ts
import apiClient from '@/lib/axios';

// ============================================
// TYPES
// ============================================
export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Subcategory {
    id: number;
    categoryId: number;
    name: string;
    slug: string;
    description: string | null;
    isActive: boolean;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
    categoryName?: string;
}

// ============================================
// CATEGORY API
// ============================================

// Get all categories (admin — includes inactive)
export const getAdminAllCategories = async (): Promise<{ success: boolean; categories: Category[] }> => {
    const res = await apiClient.get('/categories/admin/all');
    return res.data;
};

// Get public active categories
export const getPublicCategories = async (): Promise<{ success: boolean; categories: Category[] }> => {
    const res = await apiClient.get('/categories');
    return res.data;
};

// Create category
export const createCategory = async (data: { name: string; description?: string; isActive?: boolean }) => {
    const res = await apiClient.post('/categories', data);
    return res.data;
};

// Update category
export const updateCategory = async (id: number, data: { name?: string; description?: string; isActive?: boolean }) => {
    const res = await apiClient.put(`/categories/${id}`, data);
    return res.data;
};

// Delete category (soft)
export const deleteCategory = async (id: number) => {
    const res = await apiClient.delete(`/categories/${id}`);
    return res.data;
};

// ============================================
// SUBCATEGORY API
// ============================================

// Get admin subcategories (all, optionally filtered by categoryId)
export const getAdminSubcategories = async (categoryId?: number): Promise<{ success: boolean; subcategories: Subcategory[] }> => {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    const res = await apiClient.get(`/subcategories/admin${params}`);
    return res.data;
};

// Get public subcategories by category
export const getPublicSubcategories = async (categoryId: number): Promise<{ success: boolean; subcategories: Subcategory[] }> => {
    const res = await apiClient.get(`/subcategories?categoryId=${categoryId}`);
    return res.data;
};

// Create subcategory
export const createSubcategory = async (data: { categoryId: number; name: string; description?: string; orderIndex?: number }) => {
    const res = await apiClient.post('/subcategories', data);
    return res.data;
};

// Update subcategory
export const updateSubcategory = async (id: number, data: { name?: string; description?: string; categoryId?: number; isActive?: boolean; orderIndex?: number }) => {
    const res = await apiClient.put(`/subcategories/${id}`, data);
    return res.data;
};

// Delete subcategory (soft)
export const deleteSubcategory = async (id: number) => {
    const res = await apiClient.delete(`/subcategories/${id}`);
    return res.data;
};

// ============================================
// FEATURED TOGGLE
// ============================================

// Toggle quiz featured status
export const toggleQuizFeatured = async (quizId: number) => {
    const res = await apiClient.patch(`/admin/quizzes/${quizId}/toggle-featured`);
    return res.data;
};

// Toggle course featured status
export const toggleCourseFeatured = async (courseId: number) => {
    const res = await apiClient.patch(`/admin/courses/${courseId}/toggle-featured`);
    return res.data;
};
