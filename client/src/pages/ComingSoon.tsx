// client/src/pages/ComingSoon.tsx
import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Rocket, Bell, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email required',
        description: 'Please enter your email address',
      });
      return;
    }

    // todo: remove mock functionality - save email to backend
    setIsSubscribed(true);
    toast({
      title: 'Success!',
      description: 'We\'ll notify you when this feature launches.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="w-full max-w-2xl text-center">
          <div className="mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Rocket className="w-12 h-12 text-primary-foreground" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Coming Soon!
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Live Classes Feature
            </p>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We're working hard to bring you interactive live classes with expert instructors. 
              Get notified when we launch!
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8">
              {!isSubscribed ? (
                <>
                  <h3 className="font-semibold mb-4 flex items-center justify-center gap-2">
                    <Bell className="w-5 h-5" />
                    Be the first to know
                  </h3>
                  <form onSubmit={handleNotifyMe} className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1"
                      data-testid="input-notify-email"
                    />
                    <Button type="submit" data-testid="button-notify-me">
                      Notify Me
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground mt-4">
                    We'll send you an email when this feature is ready. No spam, we promise!
                  </p>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold mb-2">You're on the list!</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll notify you at <strong>{email}</strong> when live classes are available.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="font-semibold">What to expect:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">📹 Interactive Sessions</h4>
                  <p className="text-sm text-muted-foreground">
                    Real-time video classes with Q&A
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">👨‍🏫 Expert Instructors</h4>
                  <p className="text-sm text-muted-foreground">
                    Learn from experienced educators
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">📝 Live Doubt Clearing</h4>
                  <p className="text-sm text-muted-foreground">
                    Get instant answers to your questions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-12">
            <Link href="/">
              <Button variant="outline" className="gap-2" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
