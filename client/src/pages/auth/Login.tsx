// client/src/pages/auth/Login.tsx - WITH GOOGLE OAUTH
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';

export default function Login() {
    const [, setLocation] = useLocation();
    const { login, isLoading } = useAuth();
    const { toast } = useToast();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // ✅ CHECK FOR OAUTH ERRORS IN URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');

        if (error) {
            const errorMessages: Record<string, string> = {
                oauth_failed: 'Google authentication failed. Please try again.',
                no_user: 'Could not retrieve user information from Google.',
                callback_failed: 'Authentication callback failed. Please try again.',
            };

            toast({
                title: 'Authentication Error',
                description: errorMessages[error] || 'An error occurred during login.',
                variant: 'destructive',
            });

            // Clean up URL
            window.history.replaceState({}, '', '/login');
        }
    }, [toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast({
                title: 'Error',
                description: 'Please fill in all fields',
                variant: 'destructive',
            });
            return;
        }

        try {
            // IMPORTANT: let AuthContext.login handle API call and responses
            await login(email, password, {
                onUnverified: (unverifiedEmail?: string) => {
                    // Redirect to OTP screen if backend says email not verified
                    setLocation('/verify-otp', { state: { email: unverifiedEmail || email } });
                },
            });

            toast({
                title: 'Welcome back!',
                description: 'You have successfully logged in.',
            });
        } catch (error: any) {
            // Generic error handling (AuthContext should already distinguish 403)
            toast({
                title: 'Login Failed',
                description: error.message || 'Invalid email or password',
                variant: 'destructive',
            });
        }
    };

    // ✅ GOOGLE OAUTH LOGIN
    const handleGoogleLogin = () => {
        window.location.href = '/api/auth/google';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo Header */}
                <div className="text-center mb-8">
                    <Link href="/">
                        <a className="inline-flex items-center gap-2 mb-4" data-testid="link-logo">
                            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                                <GraduationCap className="w-7 h-7 text-primary-foreground" />
                            </div>
                            <span className="text-2xl font-bold">Unchi Udaan</span>
                        </a>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Welcome Back</CardTitle>
                        <CardDescription>
                            Sign in to continue your learning journey
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* ✅ GOOGLE LOGIN BUTTON */}
                        <Button
                            variant="outline"
                            className="w-full gap-2 hover:bg-accent transition-colors"
                            onClick={handleGoogleLogin}
                            type="button"
                            data-testid="button-google-login"
                        >
                            <SiGoogle className="w-4 h-4 text-red-500" />
                            Continue with Google
                        </Button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator className="w-full" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
                            </div>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email Input */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                        data-testid="input-email"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="/forgot-password">
                                        <a
                                            className="text-sm text-primary hover:underline"
                                            data-testid="link-forgot-password"
                                        >
                                            Forgot password?
                                        </a>
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                        data-testid="input-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        data-testid="button-toggle-password"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember"
                                    checked={rememberMe}
                                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                    data-testid="checkbox-remember"
                                />
                                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                                    Remember me for 30 days
                                </Label>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                                data-testid="button-login"
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>

                        {/* Sign Up Link */}
                        <p className="text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link href="/register">
                                <a
                                    className="text-primary hover:underline font-medium"
                                    data-testid="link-register"
                                >
                                    Sign up
                                </a>
                            </Link>
                        </p>

                        {/* Demo Credentials Tip */}
                        <p className="text-center text-xs text-muted-foreground mt-4">
                            Demo: admin@unchiudaan.com / Admin@12345
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
