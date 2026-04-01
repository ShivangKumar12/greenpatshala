// client/src/lib/axios.ts - CENTRALIZED AXIOS CONFIGURATION WITH AUTH
import axios from 'axios';

// ✅ FIXED: Use env var or relative path for production
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// REQUEST INTERCEPTOR - ADD AUTH TOKEN
// ============================================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // Add token to headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('[REQUEST INTERCEPTOR ERROR]', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR - HANDLE 401 ERRORS
// ============================================
apiClient.interceptors.response.use(
  (response) => {
    // Pass through successful responses
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors globally
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;

      // Don't redirect if already on auth pages
      const authPages = ['/login', '/register', '/forgot-password', '/'];
      const isOnAuthPage = authPages.some(page => currentPath === page || currentPath.startsWith(page));

      if (!isOnAuthPage) {
        console.warn('[AUTH] Token expired or invalid. Clearing session...');

        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to login with return URL
        const returnUrl = encodeURIComponent(currentPath);
        window.location.href = `/login?redirect=${returnUrl}`;
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('[NETWORK ERROR]', error.message);
    }

    return Promise.reject(error);
  }
);

// ============================================
// HELPER FUNCTIONS (OPTIONAL)
// ============================================

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): any | null => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('[GET CURRENT USER ERROR]', error);
    return null;
  }
};

/**
 * Clear authentication and redirect to login
 */
export const logout = (redirectPath?: string): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  const returnUrl = redirectPath || window.location.pathname;
  window.location.href = `/login?redirect=${encodeURIComponent(returnUrl)}`;
};

// ============================================
// EXPORT DEFAULT AXIOS INSTANCE
// ============================================
export default apiClient;
