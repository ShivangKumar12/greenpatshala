// client/src/services/jobApi.ts
import apiClient from '@/lib/axios';

// ============================================
// PUBLIC JOB APIs
// ============================================
export const getAllJobs = async (filters?: {
  search?: string;
  state?: string;
  organization?: string;
  status?: string;
}) => {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.state) params.append('state', filters.state);
  if (filters?.organization) params.append('organization', filters.organization);
  if (filters?.status) params.append('status', filters.status);

  const { data } = await apiClient.get(`/jobs${params.toString() ? '?' + params.toString() : ''}`);
  return data;
};

export const getJobById = async (jobId: number) => {
  const { data } = await apiClient.get(`/jobs/${jobId}`);
  return data;
};

export const getStates = async () => {
  const { data } = await apiClient.get('/jobs/states');
  return data;
};

export const getOrganizations = async () => {
  const { data } = await apiClient.get('/jobs/organizations');
  return data;
};

// ============================================
// ADMIN JOB MANAGEMENT APIs
// ============================================
export const createJob = async (payload: any) => {
  const { data } = await apiClient.post('/jobs', payload);
  return data;
};

export const updateJob = async (jobId: number, payload: any) => {
  const { data } = await apiClient.put(`/jobs/${jobId}`, payload);
  return data;
};

export const deleteJob = async (jobId: number) => {
  const { data } = await apiClient.delete(`/jobs/${jobId}`);
  return data;
};

