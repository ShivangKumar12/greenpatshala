// client/src/pages/payment/PaymentSuccess.tsx
import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Download, ArrowRight, Home } from 'lucide-react';

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // todo: remove mock functionality - verify payment with backend
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get('payment_id');
    const orderId = params.get('order_id');
    
    if (!paymentId || !orderId) {
      setLocation('/');
    }
  }, [setLocation]);

  // todo: remove mock functionality
  const orderDetails = {
    orderId: 'ORD-' + Date.now(),
    paymentId: 'PAY-' + Date.now(),
    courseName: 'Complete UPSC CSE Preparation',
    amount: 29999,
    date: new Date().toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
  };

  const handleDownloadInvoice = () => {
    // todo: remove mock functionality - generate and download PDF invoice
    console.log('Downloading invoice...');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8 md:p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Thank you for your purchase. Your enrollment has been confirmed.
          </p>

          <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Order ID</span>
              <span className="font-mono font-semibold">{orderDetails.orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Payment ID</span>
              <span className="font-mono font-semibold">{orderDetails.paymentId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Course</span>
              <span className="font-semibold">{orderDetails.courseName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount Paid</span>
              <span className="font-bold text-lg">₹{orderDetails.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Date</span>
              <span className="font-semibold">{orderDetails.date}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={handleDownloadInvoice}
              data-testid="button-download-invoice"
            >
              <Download className="w-4 h-4" />
              Download Invoice
            </Button>
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full gap-2" data-testid="button-go-to-dashboard">
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
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
            A confirmation email has been sent to your registered email address.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
