// client/src/services/adminQuizApi.ts
import apiClient from '@/lib/axios';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface Quiz {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  category: string;
  difficulty: string;
  duration: number;
  total_marks: number;
  passing_marks: number;
  price: number;
  discount_price: number | null;
  isFree: boolean;
  freeQuestionsCount: number;
  isFeatured: boolean;
  instructor_id: number;
  course_id: number | null;
  subjectId: number | null;
  chapterId: number | null;
  is_published: number;
  is_scheduled: number;
  shuffle_questions: number;
  show_results: number;
  negativeMarking: boolean;
  negativeMarksPerQuestion: number;
  allowReview: boolean;
  showAnswerKey: boolean;
  certificateEligible: boolean;
  attemptsAllowed: number | null;
  start_time: string | null;
  end_time: string | null;
  results_declared: number;
  results_declaration_time: string | null;
  total_attempts: number;
  total_students: number;
  created_at: string;
  updated_at: string;
  questionCount?: number;
}

export interface Question {
  id: number;
  quizId: number;
  questionType: 'mcq' | 'true_false' | 'multiple_answer' | 'match_the_column';
  question: string;
  questionImage: string | null;
  options: string[];
  correctAnswer: number | number[];
  explanation: string | null;
  marks: number;
  negativeMarks: number;
  difficulty: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: number;
  user_id: number;
  quiz_id: number;
  score: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  skipped_answers: number;
  time_taken: number;
  answers: any[];
  is_passed: number;
  percentage: number;
  rank: number | null;
  status: string;
  result_viewed: number;
  completed_at: string;
  userName?: string;
  userEmail?: string;
  quizTitle?: string;
}

export interface QuizStatistics {
  totalAttempts: number;
  totalStudents: number;
  passedAttempts: number;
  failedAttempts: number;
  averageScore: number;
  averagePercentage: number;
  passRate: number;
  averageTimeTaken: number;
  highestScore: number;
  lowestScore: number;
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
}

export interface CreateQuizData {
  title: string;
  description?: string;
  thumbnail?: string;
  category: string;
  difficulty: string;
  duration: number;
  total_marks: number;
  passing_marks: number;
  price?: number;
  discount_price?: number;
  isFree?: boolean;
  freeQuestionsCount?: number;
  course_id?: number;
  subjectId?: number;
  chapterId?: number;
  is_scheduled?: boolean;
  start_time?: string;
  end_time?: string;
  shuffle_questions?: boolean;
  show_results?: boolean;
  negativeMarking?: boolean;
  negativeMarksPerQuestion?: number;
  allowReview?: boolean;
  showAnswerKey?: boolean;
  certificateEligible?: boolean;
  attemptsAllowed?: number;
}

export interface UpdateQuizData extends Partial<CreateQuizData> {
  is_published?: boolean;
  results_declared?: boolean;
  results_declaration_time?: string;
}

export interface QuizFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  difficulty?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface QuizzesResponse {
  success: boolean;
  quizzes: Quiz[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleQuizResponse {
  success: boolean;
  quiz: Quiz & { questions?: Question[] };
  message?: string;
}

export interface QuestionsResponse {
  success: boolean;
  questions: Question[];
  message?: string;
}

export interface StatisticsResponse {
  success: boolean;
  statistics: QuizStatistics;
}

export interface ResultsResponse {
  success: boolean;
  results: QuizAttempt[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// ERROR HANDLER
// ============================================
const handleApiError = (error: any, context: string): never => {
  console.error(`[${context}]`, error);

  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || 'Server error occurred';
    const status = error.response.status;

    if (status === 401) {
      throw new Error('Unauthorized. Please login again.');
    } else if (status === 403) {
      throw new Error('You do not have permission to perform this action.');
    } else if (status === 404) {
      throw new Error('Resource not found.');
    } else if (status === 500) {
      throw new Error('Internal server error. Please try again later.');
    }

    throw new Error(message);
  } else if (error.request) {
    // Request made but no response received
    throw new Error('No response from server. Please check your connection.');
  } else {
    // Something else happened
    throw new Error(error.message || 'An unexpected error occurred');
  }
};

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get all quizzes with filters and pagination
 */
export const getAdminQuizzes = async (filters: QuizFilters = {}): Promise<QuizzesResponse> => {
  try {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.status) params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get(`/admin/quizzes?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'GET ADMIN QUIZZES ERROR');
  }
};

/**
 * Get single quiz by ID with questions
 */
export const getQuizById = async (id: number): Promise<SingleQuizResponse> => {
  try {
    const response = await apiClient.get(`/admin/quizzes/${id}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'GET QUIZ BY ID ERROR');
  }
};

/**
 * Create new quiz
 */
export const createQuiz = async (quizData: CreateQuizData): Promise<SingleQuizResponse> => {
  try {
    const response = await apiClient.post('/admin/quizzes', quizData);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'CREATE QUIZ ERROR');
  }
};

/**
 * Update existing quiz
 */
export const updateQuiz = async (id: number, quizData: UpdateQuizData): Promise<SingleQuizResponse> => {
  try {
    const response = await apiClient.put(`/admin/quizzes/${id}`, quizData);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'UPDATE QUIZ ERROR');
  }
};

/**
 * Delete quiz permanently
 */
export const deleteQuiz = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.delete(`/admin/quizzes/${id}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'DELETE QUIZ ERROR');
  }
};

/**
 * Toggle quiz publish status
 */
export const togglePublish = async (id: number): Promise<SingleQuizResponse> => {
  try {
    const response = await apiClient.patch(`/admin/quizzes/${id}/toggle-publish`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'TOGGLE PUBLISH ERROR');
  }
};

/**
 * Toggle quiz free/paid status
 */
export const toggleFree = async (id: number): Promise<SingleQuizResponse> => {
  try {
    const response = await apiClient.patch(`/admin/quizzes/${id}/toggle-free`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'TOGGLE FREE ERROR');
  }
};

/**
 * Update quiz pricing
 */
export const updateQuizPricing = async (
  id: number,
  pricingData: { price: number; discount_price?: number; isFree: boolean }
): Promise<SingleQuizResponse> => {
  try {
    const response = await apiClient.patch(`/admin/quizzes/${id}/pricing`, pricingData);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'UPDATE QUIZ PRICING ERROR');
  }
};

/**
 * Add multiple questions to quiz (bulk operation)
 */
export const addQuestions = async (
  id: number,
  questions: Partial<Question>[]
): Promise<QuestionsResponse> => {
  try {
    const response = await apiClient.post(`/admin/quizzes/${id}/questions`, { questions });
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'ADD QUESTIONS ERROR');
  }
};

/**
 * Update single question
 */
export const updateQuestion = async (
  quizId: number,
  questionId: number,
  questionData: Partial<Question>
): Promise<{ success: boolean; question: Question; message: string }> => {
  try {
    const response = await apiClient.put(`/admin/quizzes/${quizId}/questions/${questionId}`, questionData);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'UPDATE QUESTION ERROR');
  }
};

/**
 * Delete single question
 */
export const deleteQuestion = async (
  quizId: number,
  questionId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.delete(`/admin/quizzes/${quizId}/questions/${questionId}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'DELETE QUESTION ERROR');
  }
};

/**
 * Get quiz statistics and analytics
 */
export const getQuizStatistics = async (id: number): Promise<StatisticsResponse> => {
  try {
    const response = await apiClient.get(`/admin/quizzes/${id}/statistics`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'GET QUIZ STATISTICS ERROR');
  }
};

/**
 * Get all quiz attempts/results with pagination
 */
export const getQuizResults = async (
  id: number,
  page = 1,
  limit = 50
): Promise<ResultsResponse> => {
  try {
    const response = await apiClient.get(`/admin/quizzes/${id}/results?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'GET QUIZ RESULTS ERROR');
  }
};

/**
 * Export quiz questions to PDF
 */
export const exportQuizQuestions = async (id: number): Promise<void> => {
  try {
    const response = await apiClient.get(`/admin/quizzes/${id}/export/questions`, {
      responseType: 'blob',
    });

    // Create blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quiz-${id}-questions.pdf`);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    handleApiError(error, 'EXPORT QUIZ QUESTIONS ERROR');
  }
};

/**
 * Export quiz results to PDF
 */
export const exportQuizResults = async (id: number): Promise<void> => {
  try {
    const response = await apiClient.get(`/admin/quizzes/${id}/export/results`, {
      responseType: 'blob',
    });

    // Create blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quiz-${id}-results.pdf`);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    handleApiError(error, 'EXPORT QUIZ RESULTS ERROR');
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format price with Indian Rupee symbol
 * @param price - Price amount
 * @param isFree - Whether the quiz is free
 * @returns Formatted price string
 */
export const formatPrice = (price: number | null, isFree: boolean = false): string => {
  if (isFree) return 'FREE';
  if (!price || price === 0) return 'FREE';
  return `₹${price.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Format duration in minutes to readable format
 * @param minutes - Duration in minutes
 * @returns Formatted duration string (e.g., "2h 30m" or "45 min")
 */
export const formatDuration = (minutes: number): string => {
  if (!minutes || minutes <= 0) return '0 min';
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

/**
 * Get difficulty badge color classes
 * @param difficulty - Difficulty level (easy, medium, hard)
 * @returns Tailwind CSS classes for badge styling
 */
export const getDifficultyColor = (difficulty: string): string => {
  const colors: Record<string, string> = {
    easy: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200',
    hard: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200',
  };
  return colors[difficulty.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200';
};

/**
 * Get status badge variant
 * @param isPublished - Whether the quiz is published (1 or 0)
 * @returns Badge variant string
 */
export const getStatusColor = (isPublished: number): 'default' | 'secondary' => {
  return isPublished === 1 ? 'default' : 'secondary';
};

/**
 * Get status text
 * @param isPublished - Whether the quiz is published
 * @returns Status text
 */
export const getStatusText = (isPublished: number): string => {
  return isPublished === 1 ? 'Published' : 'Draft';
};

/**
 * Calculate discount percentage
 * @param price - Original price
 * @param discountPrice - Discounted price
 * @returns Discount percentage
 */
export const calculateDiscount = (price: number, discountPrice: number | null): number => {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
};

/**
 * Format date to readable string
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Check if quiz is scheduled and active
 * @param quiz - Quiz object
 * @returns Whether quiz is currently active
 */
export const isQuizActive = (quiz: Quiz): boolean => {
  if (!quiz.is_scheduled || !quiz.start_time || !quiz.end_time) return true;

  const now = new Date();
  const start = new Date(quiz.start_time);
  const end = new Date(quiz.end_time);

  return now >= start && now <= end;
};

/**
 * Get quiz status label
 * @param quiz - Quiz object
 * @returns Status label string
 */
export const getQuizStatusLabel = (quiz: Quiz): string => {
  if (!quiz.is_published) return 'Draft';
  if (quiz.is_scheduled) {
    if (!quiz.start_time) return 'Scheduled';
    const now = new Date();
    const start = new Date(quiz.start_time);
    const end = quiz.end_time ? new Date(quiz.end_time) : null;

    if (now < start) return 'Scheduled';
    if (end && now > end) return 'Ended';
    return 'Live';
  }
  return 'Published';
};

/**
 * Validate quiz data before submission
 * @param data - Quiz data to validate
 * @returns Validation result with errors
 */
export const validateQuizData = (data: Partial<CreateQuizData>): {
  isValid: boolean;
  errors: string[]
} => {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!data.category) {
    errors.push('Category is required');
  }

  if (!data.difficulty) {
    errors.push('Difficulty is required');
  }

  if (!data.duration || data.duration <= 0) {
    errors.push('Duration must be greater than 0');
  }

  if (!data.total_marks || data.total_marks <= 0) {
    errors.push('Total marks must be greater than 0');
  }

  if (data.passing_marks !== undefined && data.total_marks !== undefined) {
    if (data.passing_marks < 0 || data.passing_marks > data.total_marks) {
      errors.push('Passing marks must be between 0 and total marks');
    }
  }

  if (data.discount_price && data.price && data.discount_price > data.price) {
    errors.push('Discount price cannot be greater than original price');
  }

  if (data.is_scheduled && !data.start_time) {
    errors.push('Start time is required for scheduled quizzes');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Export all types for use in components
export type {
  Quiz,
  Question,
  QuizAttempt,
  QuizStatistics,
  CreateQuizData,
  UpdateQuizData,
  QuizFilters,
  QuizzesResponse,
  SingleQuizResponse,
  QuestionsResponse,
  StatisticsResponse,
  ResultsResponse,
};

