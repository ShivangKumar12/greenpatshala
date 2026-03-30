// API Service - Axios instance connected to existing Express.js backend
import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from './storage';

// ============================================
// API CONFIGURATION
// ============================================
// Hardcoded API URL for seamless independent execution
const BASE_URL = 'https://2a46-2409-40d1-43f-3923-7cc4-37cf-f301-c392.ngrok-free.app/api';
console.log('📡 API Base URL:', BASE_URL);

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
    async (config) => {
        const token = await storage.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear storage
            await storage.clearAll();
        }
        return Promise.reject(error);
    }
);

// ============================================
// AUTH API
// ============================================
export const authAPI = {
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    register: (data: { name: string; email: string; password: string; phone?: string }) =>
        api.post('/auth/register', data),
    verifyOTP: (data: { email: string; otp: string }) =>
        api.post('/auth/verify-otp', data),
    resendOTP: (data: { email: string }) =>
        api.post('/auth/resend-otp', data),
    forgotPassword: (data: { email: string }) =>
        api.post('/auth/forgot-password', data),
    resetPassword: (data: { token: string; password: string }) =>
        api.post('/auth/reset-password', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data: any) => api.put('/auth/profile', data),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
        api.put('/auth/change-password', data),
    logout: () => api.post('/auth/logout'),
};

// ============================================
// COURSES API
// ============================================
export const coursesAPI = {
    getAll: (params?: any) => api.get('/courses', { params }),
    getById: (id: number) => api.get(`/courses/${id}`),
    getCategories: () => api.get('/courses/categories/list'),
    getModules: (id: number) => api.get(`/courses/${id}/modules`),
    getMyCourses: () => api.get('/courses/my/list'),
    getAccess: (id: number) => api.get(`/courses/${id}/access`),
    enroll: (id: number) => api.post(`/courses/${id}/enroll`),
};

// ============================================
// QUIZZES API
// ============================================
export const quizzesAPI = {
    getAll: (params?: any) => api.get('/quizzes', { params }),
    getById: (id: number) => api.get(`/quizzes/${id}`),
    getForAttempt: (id: number) => api.get(`/quizzes/${id}/attempt`),
    submit: (id: number, data: any) => api.post(`/quizzes/${id}/submit`, data),
    getMyAttempts: () => api.get('/users/my-attempts'),
    getAttemptById: (id: number) => api.get(`/quiz-attempts/${id}`),
    getMyQuizzes: () => api.get('/quizzes/my-quizzes'),
};

// ============================================
// STUDY MATERIALS API
// ============================================
export const studyMaterialsAPI = {
    getAll: (params?: any) => api.get('/study-materials', { params }),
    getById: (id: number) => api.get(`/study-materials/${id}`),
    incrementDownload: (id: number) => api.post(`/study-materials/${id}/download`),
    getPurchased: () => api.get('/study-materials/purchased'),
};

// ============================================
// JOBS API
// ============================================
export const jobsAPI = {
    getAll: (params?: any) => api.get('/jobs', { params }),
    getById: (id: number) => api.get(`/jobs/${id}`),
    getStates: () => api.get('/jobs/states'),
    getOrganizations: () => api.get('/jobs/organizations'),
};

// ============================================
// CURRENT AFFAIRS API
// ============================================
export const currentAffairsAPI = {
    getAll: (params?: any) => api.get('/current-affairs', { params }),
    getById: (id: number) => api.get(`/current-affairs/${id}`),
};

// ============================================
// PAYMENTS API
// ============================================
export const paymentsAPI = {
    createCourseOrder: (courseId: number, data?: any) =>
        api.post(`/payment/course/${courseId}/create-order`, data),
    createQuizOrder: (quizId: number, data?: any) =>
        api.post(`/payment/quiz/${quizId}/create-order`, data),
    createStudyMaterialOrder: (materialId: number, data?: any) =>
        api.post(`/payment/study-material/${materialId}/create-order`, data),
    verifyPayment: (data: any) => api.post('/payment/verify', data),
};

// ============================================
// FEEDBACK API
// ============================================
export const feedbackAPI = {
    submit: (data: { name: string; email?: string; message: string; rating: number }) =>
        api.post('/feedbacks', data),
    getPublic: () => api.get('/feedbacks/public'),
};

// ============================================
// SETTINGS API
// ============================================
export const settingsAPI = {
    getPublic: () => api.get('/settings/public'),
};

export default api;
