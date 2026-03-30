// client/src/services/quizApi.ts
import apiClient from '@/lib/axios';

// ============================================
// PUBLIC QUIZ APIs
// ============================================
export const getAllQuizzes = async (filters?: {
  category?: string;
  difficulty?: string;
  courseId?: number;
}) => {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.difficulty) params.append('difficulty', filters.difficulty);
  if (filters?.courseId) params.append('courseId', filters.courseId.toString());
  
  const { data } = await apiClient.get(`/quizzes${params.toString() ? '?' + params.toString() : ''}`);
  return data;
};

export const getQuizById = async (quizId: number) => {
  const { data } = await apiClient.get(`/quizzes/${quizId}`);
  return data;
};

// ✅ NEW - Get quiz for attempt (requires purchase, returns questions)
export const getQuizForAttempt = async (quizId: number) => {
  const { data } = await apiClient.get(`/quizzes/${quizId}/attempt`);
  return data;
};

// ============================================
// QUIZ ATTEMPT APIs
// ============================================
export const submitQuizAttempt = async (quizId: number, payload: {
  answers: Array<{ questionId: number; selectedOption: number | null }>;
  timeTaken: number;
}) => {
  const { data } = await apiClient.post(`/quizzes/${quizId}/submit`, payload);
  return data;
};

export const getUserAttempts = async () => {
  const { data } = await apiClient.get('/users/my-attempts');
  return data;
};

export const getQuizAttemptById = async (attemptId: number) => {
  const { data } = await apiClient.get(`/quiz-attempts/${attemptId}`);
  return data;
};

// ============================================
// INSTRUCTOR QUIZ MANAGEMENT APIs
// ============================================
export const getInstructorQuizzes = async () => {
  const { data } = await apiClient.get('/quizzes/instructor/my-quizzes');
  return data;
};

export const createQuiz = async (payload: any) => {
  const { data } = await apiClient.post('/quizzes', payload);
  return data;
};

export const updateQuiz = async (quizId: number, payload: any) => {
  const { data } = await apiClient.put(`/quizzes/${quizId}`, payload);
  return data;
};

export const togglePublishQuiz = async (quizId: number, isPublished: boolean) => {
  const { data } = await apiClient.patch(`/quizzes/${quizId}/publish`, { is_published: isPublished });
  return data;
};

export const declareResults = async (quizId: number) => {
  const { data } = await apiClient.patch(`/quizzes/${quizId}/results`, {});
  return data;
};

export const deleteQuiz = async (quizId: number) => {
  const { data } = await apiClient.delete(`/quizzes/${quizId}`);
  return data;
};

// ============================================
// QUESTION MANAGEMENT APIs
// ============================================
export const getQuizQuestions = async (quizId: number) => {
  const { data } = await apiClient.get(`/quizzes/${quizId}/questions`);
  return data;
};

export const addQuestion = async (quizId: number, payload: any) => {
  const { data } = await apiClient.post(`/quizzes/${quizId}/questions`, payload);
  return data;
};

export const addBulkQuestions = async (quizId: number, questions: any[]) => {
  const { data } = await apiClient.post(`/quizzes/${quizId}/questions/bulk`, { questions });
  return data;
};

export const updateQuestion = async (questionId: number, payload: any) => {
  const { data } = await apiClient.put(`/questions/${questionId}`, payload);
  return data;
};

export const deleteQuestion = async (questionId: number) => {
  const { data } = await apiClient.delete(`/questions/${questionId}`);
  return data;
};

// ============================================
// ANALYTICS APIs
// ============================================
export const getQuizAttempts = async (quizId: number) => {
  const { data } = await apiClient.get(`/quizzes/${quizId}/attempts`);
  return data;
};

export const getQuizStatistics = async (quizId: number) => {
  const { data } = await apiClient.get(`/quizzes/${quizId}/statistics`);
  return data;
};

