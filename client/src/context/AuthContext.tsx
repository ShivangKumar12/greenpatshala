// client/src/context/AuthContext.tsx - PRODUCTION READY WITH GOOGLE OAUTH
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

export type UserRole = 'user' | 'instructor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
}

interface LoginOptions {
  onUnverified?: (email?: string) => void;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, options?: LoginOptions) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ PRODUCTION FIX: Use separate backend URL for API calls
const getApiUrl = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
  return `${backendUrl}/api/auth`;
};

const API_URL = getApiUrl();
console.log('🔗 AuthContext API_URL (backend):', API_URL);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // ✅ FIX: Check for existing session on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      // ✅ Skip checkAuth if we're on OAuth callback page (prevents race condition)
      const isOAuthCallback = window.location.pathname === '/auth/callback';

      if (token && !isOAuthCallback) {
        try {
          console.log('🔍 Checking existing auth...');

          const response = await fetch(`${API_URL}/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            console.log('✅ Existing session restored:', data.user.email);
          } else {
            console.warn('⚠️ Token invalid, clearing...');
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('❌ Auth check error:', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Role-based redirect helper
  const redirectByRole = (role: UserRole) => {
    switch (role) {
      case 'admin':
        setLocation('/admin');
        break;
      case 'instructor':
        setLocation('/instructor');
        break;
      case 'user':
      default:
        setLocation('/dashboard');
        break;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      localStorage.setItem('token', data.token);
      setUser(data.user);
      redirectByRole(data.user.role);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const resendOTP = async (email: string) => {
    try {
      const response = await fetch(`${API_URL}/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string, options?: LoginOptions) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresVerification) {
          setIsLoading(false);

          if (options?.onUnverified) {
            options.onUnverified(data.email || email);
          } else {
            setLocation(`/verify-otp?email=${encodeURIComponent(email)}`);
          }

          throw new Error(data.message || 'Please verify your email');
        }

        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setUser(data.user);
      redirectByRole(data.user.role);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  // ✅ FIXED: LOGIN WITH TOKEN (FOR GOOGLE OAUTH)
  const loginWithToken = useCallback(async (token: string) => {
    try {
      setIsLoading(true);

      console.log('🔐 Processing OAuth token...');

      // ✅ Step 1: Store token FIRST
      localStorage.setItem('token', token);

      // ✅ Step 2: Verify token and get user data
      const response = await fetch(`${API_URL}/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error('❌ Token verification failed:', data.message);
        localStorage.removeItem('token');
        throw new Error(data.message || 'Token verification failed');
      }

      // ✅ Step 3: Set user and keep token
      const userData = {
        id: data.user.id.toString(),
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        avatar: data.user.avatar,
        isVerified: data.user.is_verified,
      };

      setUser(userData);
      console.log('✅ OAuth login successful:', userData.email);

      // ✅ Don't redirect here - let OAuthCallback handle it
    } catch (error: any) {
      console.error('❌ Login with token failed:', error);
      localStorage.removeItem('token');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      setLocation('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithToken,
        register,
        verifyOTP,
        resendOTP,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
