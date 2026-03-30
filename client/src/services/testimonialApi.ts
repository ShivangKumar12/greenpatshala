// client/src/services/testimonialApi.ts
import apiClient from '@/lib/axios';

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar?: string;
  content: string;
  rating: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestimonialData {
  name: string;
  role: string;
  avatar?: string;
  content: string;
  rating?: number;
  displayOrder?: number;
}

/**
 * Get active testimonials for homepage
 */
export const getTestimonials = async (limit = 10) => {
  const response = await apiClient.get(`/testimonials?limit=${limit}`);
  return response.data;
};

/**
 * Get all testimonials (Admin only)
 */
export const getAllTestimonials = async () => {
  const response = await apiClient.get('/testimonials/admin');
  return response.data;
};

/**
 * Create testimonial (Admin only)
 */
export const createTestimonial = async (data: CreateTestimonialData) => {
  const response = await apiClient.post('/testimonials/admin', data);
  return response.data;
};

/**
 * Update testimonial (Admin only)
 */
export const updateTestimonial = async (
  id: number,
  data: Partial<CreateTestimonialData> & { isActive?: boolean }
) => {
  const response = await apiClient.patch(`/testimonials/admin/${id}`, data);
  return response.data;
};

/**
 * Delete testimonial (Admin only)
 */
export const deleteTestimonial = async (id: number) => {
  const response = await apiClient.delete(`/testimonials/admin/${id}`);
  return response.data;
};

