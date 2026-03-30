// client/src/pages/payment/PaymentFailure.tsx
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, RefreshCw, Home, HelpCircle } from 'lucide-react';

export default function PaymentFailure() {
  // todo: remove mock functionality
  const failureDetails = {
    orderId: 'ORD-' + Date.now(),
    reason: 'Payment was declined by your bank',
    amount: 29999,
  };

  const handleRetryPayment = () => {
    // todo: remove mock functionality - retry payment flow
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8 md:p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
          <p className="text-lg text-muted-foreground mb-8">
            We couldn't process your payment. Please try again.
          </p>

          <Alert variant="destructive" className="mb-8 text-left">
            <AlertDescription>
              <strong>Reason:</strong> {failureDetails.reason}
            </AlertDescription>
          </Alert>

          <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Order ID</span>
              <span className="font-mono font-semibold">{failureDetails.orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="font-bold text-lg">₹{failureDetails.amount.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-left">Common reasons for payment failure:</h3>
            <ul className="text-left text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                Insufficient balance in your account
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                Incorrect card details or CVV
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                Transaction limit exceeded
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                Network or connectivity issues
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button 
              className="flex-1 gap-2"
              onClick={handleRetryPayment}
              data-testid="button-retry-payment"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Payment
            </Button>
            <Link href="/contact" className="flex-1">
              <Button variant="outline" className="w-full gap-2" data-testid="button-contact-support">
                <HelpCircle className="w-4 h-4" />
                Contact Support
              </Button>
            </Link>
          </div>

          <Link href="/">
            <Button variant="ghost" className="gap-2" data-testid="button-back-home">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>

          <p className="text-xs text-muted-foreground mt-8">
            No amount has been deducted from your account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
