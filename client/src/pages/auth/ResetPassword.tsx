// client/src/pages/auth/ResetPassword.tsx - FIXED
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Lock, CheckCircle2, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/axios'; // ✅ ADDED

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast({
        title: 'Invalid Link',
        description: 'Reset token is missing. Please request a new reset link.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const validatePassword = () => {
    if (password.length < 8) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return false;
    }
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords Don\'t Match',
        description: 'Please make sure both passwords match',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  // ✅ FIXED: Using apiClient instead of fetch
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/reset-password', { 
        token, 
        newPassword: password 
      }); // ✅ CHANGED

      if (response.data.success) {
        setResetSuccess(true);
        toast({
          title: 'Success!',
          description: 'Your password has been reset successfully.',
        });
        setTimeout(() => setLocation('/login'), 3000);
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to reset password',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Something went wrong. Please try again.', // ✅ CHANGED
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Password Reset Successful!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your password has been updated successfully.
          </p>
          
          <p className="text-sm text-gray-500 mb-8">
            Redirecting to login page...
          </p>
          
          <Link href="/login">
            <a className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Go to Login
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-2xl">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters long
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login">
            <a className="text-gray-600 hover:text-gray-900 font-medium">
              Back to login
            </a>
          </Link>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Unchi Udaan - Empowering Your Success
        </p>
      </div>
    </div>
  );
}
