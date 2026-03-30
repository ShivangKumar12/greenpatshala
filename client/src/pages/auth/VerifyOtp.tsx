// client/src/pages/auth/VerifyOtp.tsx
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, Mail, ArrowLeft } from 'lucide-react';

export default function VerifyOtp() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const email = searchParams.get('email') || '';
  const { toast } = useToast();
  const { verifyOTP } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { resendOTP } = useAuth();

  useEffect(() => {
    if (!email) {
      // No email provided, go back to register
      setLocation('/register');
      return;
    }
  }, [email, setLocation]);

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    if (pastedData.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter the complete 6-digit OTP',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);

    try {
      await verifyOTP(email, otpString);
      toast({
        title: 'Email Verified!',
        description: 'Your account has been verified successfully.',
      });
      // Do NOT manually redirect here; AuthContext.verifyOTP already redirects by role
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP(email);
      setCanResend(false);
      setCountdown(60);
      toast({
        title: 'OTP Resent',
        description: 'A new verification code has been sent to your email.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to Resend',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4" data-testid="link-logo">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">Unchi Udaan</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a 6-digit verification code to
              <br />
              <span className="font-medium text-foreground">{email || 'your email'}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-semibold"
                  data-testid={`input-otp-${index}`}
                />
              ))}
            </div>

            <Button
              className="w-full"
              onClick={handleVerify}
              disabled={isVerifying || otp.join('').length !== 6}
              data-testid="button-verify"
            >
              {isVerifying ? 'Verifying...' : 'Verify Email'}
            </Button>

            <div className="text-center">
              {canResend ? (
                <button
                  onClick={handleResend}
                  className="text-sm text-primary hover:underline"
                  data-testid="button-resend"
                >
                  Resend verification code
                </button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Resend code in <span className="font-medium">{countdown}s</span>
                </p>
              )}
            </div>

            <div className="text-center pt-4 border-t">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                data-testid="link-back"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to registration
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
