// client/src/pages/Unauthorized.tsx
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Unauthorized() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8 md:p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
          </div>

          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-lg text-muted-foreground mb-8">
            You don't have permission to access this page.
          </p>

          {isAuthenticated ? (
            <>
              <div className="bg-muted/50 rounded-lg p-4 mb-8">
                <p className="text-sm text-muted-foreground mb-2">You are logged in as:</p>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-muted-foreground capitalize">Role: {user?.role}</p>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                This page is restricted to {user?.role === 'user' ? 'instructors and admins' : 'administrators'} only.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={() => window.history.back()}
                  data-testid="button-go-back"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button className="w-full gap-2" data-testid="button-dashboard">
                    <Home className="w-4 h-4" />
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Please log in to access this content.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/login" className="flex-1">
                  <Button className="w-full" data-testid="button-login">
                    Login
                  </Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full gap-2" data-testid="button-home">
                    <Home className="w-4 h-4" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
