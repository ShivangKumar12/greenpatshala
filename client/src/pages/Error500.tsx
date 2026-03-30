// client/src/pages/Error500.tsx
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ServerCrash, Home, RefreshCw } from 'lucide-react';

export default function Error500() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8 md:p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
            <ServerCrash className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-6xl font-bold mb-4">500</h1>
          <h2 className="text-2xl font-semibold mb-4">Server Error</h2>
          <p className="text-muted-foreground mb-8">
            Oops! Something went wrong on our end. We're working to fix the issue.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleRefresh} className="gap-2" data-testid="button-refresh">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Link href="/">
              <Button variant="outline" className="gap-2 w-full sm:w-auto" data-testid="button-home">
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-8">
            If the problem persists, please contact support
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
