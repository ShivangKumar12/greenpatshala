// client/src/services/adminSubjectApi.ts
import apiClient from '@/lib/axios';

// ============================================
// TYPES
// ============================================
export interface TestSubject {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    isActive: boolean;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
    chapterCount?: number;
    testCount?: number;
}

export interface TestChapter {
    id: number;
    subjectId: number;
    name: string;
    slug: string;
    description: string | null;
    isActive: boolean;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
    subjectName?: string;
    testCount?: number;
}

// ============================================
// ADMIN SUBJECT APIs
// ============================================
export const getAdminSubjects = async () => {
    const { data } = await apiClient.get('/test-subjects/admin/all');
    return data;
};

export const createSubject = async (payload: {
    name: string;
    description?: string;
    thumbnail?: string;
    isActive?: boolean;
    orderIndex?: number;
}) => {
    const { data } = await apiClient.post('/test-subjects/admin', payload);
    return data;
};

export const updateSubject = async (id: number, payload: {
    name?: string;
    description?: string;
    thumbnail?: string;
    isActive?: boolean;
    orderIndex?: number;
}) => {
    const { data } = await apiClient.put(`/test-subjects/admin/${id}`, payload);
    return data;
};

export const deleteSubject = async (id: number) => {
    const { data } = await apiClient.delete(`/test-subjects/admin/${id}`);
    return data;
};

// ============================================
// ADMIN CHAPTER APIs
// ============================================
export const getAdminChapters = async (subjectId?: number) => {
    const params = subjectId ? `?subjectId=${subjectId}` : '';
    const { data } = await apiClient.get(`/admin/test-chapters${params}`);
    return data;
};

export const createChapter = async (payload: {
    subjectId: number;
    name: string;
    description?: string;
    isActive?: boolean;
    orderIndex?: number;
}) => {
    const { data } = await apiClient.post('/admin/test-chapters', payload);
    return data;
};

export const updateChapter = async (id: number, payload: {
    name?: string;
    description?: string;
    subjectId?: number;
    isActive?: boolean;
    orderIndex?: number;
}) => {
    const { data } = await apiClient.put(`/admin/test-chapters/${id}`, payload);
    return data;
};

export const deleteChapter = async (id: number) => {
    const { data } = await apiClient.delete(`/admin/test-chapters/${id}`);
    return data;
};

// ============================================
// PUBLIC APIs (for student flow)
// ============================================
export const getPublicSubjects = async () => {
    const { data } = await apiClient.get('/test-subjects');
    return data;
};

export const getSubjectWithChapters = async (subjectId: number) => {
    const { data } = await apiClient.get(`/test-subjects/${subjectId}`);
    return data;
};

export const getTestsBySubject = async (subjectId: number, chapterId?: number) => {
    const params = chapterId ? `?chapterId=${chapterId}` : '';
    const { data } = await apiClient.get(`/test-subjects/${subjectId}/tests${params}`);
    return data;
};
