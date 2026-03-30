// client/src/pages/auth/OAuthCallback.tsx
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function OAuthCallback() {
  const [, setLocation] = useLocation();
  const { loginWithToken } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
          throw new Error('No token received from OAuth provider');
        }

        console.log('✅ Processing OAuth callback with token');

        // Login with token
        await loginWithToken(token);

        toast({
          title: 'Welcome!',
          description: 'You have successfully signed in with Google.',
        });

        // Redirect to dashboard
        setTimeout(() => {
          setLocation('/dashboard');
        }, 500);
      } catch (error: any) {
        console.error('❌ OAuth callback processing error:', error);
        
        toast({
          title: 'Authentication Failed',
          description: error.message || 'Failed to complete sign in',
          variant: 'destructive',
        });

        setTimeout(() => {
          setLocation('/login?error=oauth_failed');
        }, 1000);
      }
    };

    processCallback();
  }, [loginWithToken, setLocation, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="text-center space-y-4">
        <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
        <div>
          <h2 className="text-2xl font-bold mb-2">Completing sign in...</h2>
          <p className="text-muted-foreground">Please wait while we set up your account</p>
        </div>
      </div>
    </div>
  );
}
