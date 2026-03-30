// client/src/services/currentAffairsApi.ts
import apiClient from '@/lib/axios';
import db from '../db'; // your configured Drizzle instance
import { currentAffairs } from '../../shared/schema';

export interface CurrentAffairPayload {
  title: string;
  summary?: string;
  content: string;
  category: string;
  tags?: string[] | null;
  thumbnail?: string;
  source?: string;
  sourceUrl?: string;
  date: string;
  importance?: 'low' | 'medium' | 'high';
}

export interface CurrentAffair extends CurrentAffairPayload {
  id: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentAffairsFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  importance?: string;
  fromDate?: string;
  toDate?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API_BASE_URL (with /api prefix) is already handled inside api instance
// so just call `/current-affairs` paths.

export const getCurrentAffairs = async (
  filters: CurrentAffairsFilters = {},
): Promise<PaginatedResponse<CurrentAffair>> => {
  const params = new URLSearchParams();
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.importance) params.append('importance', filters.importance);
  if (filters.fromDate) params.append('fromDate', filters.fromDate);
  if (filters.toDate) params.append('toDate', filters.toDate);

  const query = params.toString();
  const { data } = await apiClient.get(
    `/current-affairs${query ? `?${query}` : ''}`,
  );
  return data;
};

export const getCurrentAffair = async (
  id: number,
): Promise<{ success: boolean; item: CurrentAffair }> => {
  const { data } = await apiClient.get(`/current-affairs/${id}`);
  return data;
};

export const createCurrentAffair = async (
  payload: CurrentAffairPayload,
): Promise<{ success: boolean; item: CurrentAffair }> => {
  const { data } = await apiClient.post('/current-affairs', payload);
  return data;
};

export const updateCurrentAffair = async (
  id: number,
  payload: Partial<CurrentAffairPayload>,
): Promise<{ success: boolean; item: CurrentAffair }> => {
  const { data } = await apiClient.put(`/current-affairs/${id}`, payload);
  return data;
};

export const deleteCurrentAffair = async (
  id: number,
): Promise<{ success: boolean }> => {
  const { data } = await apiClient.delete(`/current-affairs/${id}`);
  return data;
};

