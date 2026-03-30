// client/src/services/feedbackApi.ts
import apiClient from '@/lib/axios';

export interface Feedback {
  id: number;
  name: string;
  email?: string;
  message: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  userId?: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitFeedbackData {
  name?: string;
  email?: string;
  message: string;
  rating: number;
}

/**
 * Submit feedback (Public - no auth required)
 */
export const submitFeedback = async (data: SubmitFeedbackData) => {
  const response = await apiClient.post('/feedbacks', data);
  return response.data;
};

/**
 * Get public approved feedbacks for homepage
 */
export const getPublicFeedbacks = async (limit = 10) => {
  const response = await apiClient.get(`/feedbacks/public?limit=${limit}`);
  return response.data;
};

/**
 * Get all feedbacks (Admin only)
 */
export const getAllFeedbacks = async (params?: {
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  const response = await apiClient.get(`/feedbacks/admin?${queryParams.toString()}`);
  return response.data;
};

/**
 * Update feedback status/visibility (Admin only)
 */
export const updateFeedback = async (
  id: number,
  data: { status?: string; isPublic?: boolean }
) => {
  const response = await apiClient.patch(`/feedbacks/admin/${id}`, data);
  return response.data;
};

/**
 * Delete feedback (Admin only)
 */
export const deleteFeedback = async (id: number) => {
  const response = await apiClient.delete(`/feedbacks/admin/${id}`);
  return response.data;
};

