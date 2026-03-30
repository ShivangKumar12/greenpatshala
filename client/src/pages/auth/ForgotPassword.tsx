// client/src/pages/auth/ForgotPassword.tsx - FIXED
import { useState } from 'react';
import { Link } from 'wouter';
import { Mail, ArrowLeft, CheckCircle2, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/axios'; // ✅ ADDED

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  // ✅ FIXED: Using apiClient instead of fetch
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/forgot-password', { email }); // ✅ CHANGED

      if (response.data.success) {
        setEmailSent(true);
        toast({
          title: 'Email sent!',
          description: 'Check your inbox for password reset instructions.',
        });
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to send reset email',
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

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Check Your Email
          </h2>
          
          <p className="text-gray-600 mb-8">
            We've sent password reset instructions to <strong>{email}</strong>
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Didn't receive the email?</strong><br />
              Check your spam folder or{' '}
              <button
                onClick={() => setEmailSent(false)}
                className="underline font-semibold hover:text-blue-900"
              >
                try again
              </button>
            </p>
          </div>
          
          <Link href="/login">
            <a className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
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
            Forgot Password?
          </h1>
          <p className="text-gray-600">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login">
            <a className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" />
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
