// Authentication Context - manages login state, token, user data
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { storage } from '../services/storage';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    phone?: string;
    bio?: string;
    is_verified: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<any>;
    register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<any>;
    verifyOTP: (email: string, otp: string) => Promise<any>;
    resendOTP: (email: string) => Promise<any>;
    forgotPassword: (email: string) => Promise<any>;
    logout: () => Promise<void>;
    updateUser: (data: any) => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Auto-login on app start
    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await storage.getToken();
            const storedUser = await storage.getUser();
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(storedUser);
                // Verify token is still valid
                try {
                    const res = await authAPI.getMe();
                    if (res.data?.user) {
                        setUser(res.data.user);
                        await storage.setUser(res.data.user);
                    }
                } catch {
                    // Token expired
                    await storage.clearAll();
                    setToken(null);
                    setUser(null);
                }
            }
        } catch (error) {
            console.error('Auth load error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const res = await authAPI.login({ email, password });
        const { token: newToken, user: userData } = res.data;
        if (newToken) {
            await storage.setToken(newToken);
            await storage.setUser(userData);
            setToken(newToken);
            setUser(userData);
        }
        return res.data;
    };

    const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
        const res = await authAPI.register(data);
        return res.data;
    };

    const verifyOTP = async (email: string, otp: string) => {
        const res = await authAPI.verifyOTP({ email, otp });
        const { token: newToken, user: userData } = res.data;
        if (newToken) {
            await storage.setToken(newToken);
            await storage.setUser(userData);
            setToken(newToken);
            setUser(userData);
        }
        return res.data;
    };

    const resendOTP = async (email: string) => {
        const res = await authAPI.resendOTP({ email });
        return res.data;
    };

    const forgotPassword = async (email: string) => {
        const res = await authAPI.forgotPassword({ email });
        return res.data;
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch { }
        await storage.clearAll();
        setToken(null);
        setUser(null);
    };

    const updateUser = (data: any) => {
        setUser((prev) => (prev ? { ...prev, ...data } : null));
        if (user) {
            storage.setUser({ ...user, ...data });
        }
    };

    const refreshUser = async () => {
        try {
            const res = await authAPI.getMe();
            if (res.data?.user) {
                setUser(res.data.user);
                await storage.setUser(res.data.user);
            }
        } catch { }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!token && !!user,
                login,
                register,
                verifyOTP,
                resendOTP,
                forgotPassword,
                logout,
                updateUser,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
