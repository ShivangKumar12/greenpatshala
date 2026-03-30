// client/src/pages/payment/StudyMaterialPayment.tsx - WITH REFETCH TRIGGER
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  createStudyMaterialOrder,
  verifyPayment,
} from '@/services/paymentApi';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function StudyMaterialPayment() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [materialTitle, setMaterialTitle] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const id = location.split('/').pop();
  const studyMaterialId = Number(id);

  useEffect(() => {
    if (typeof window.Razorpay === 'undefined') {
      setError('Payment system not loaded. Please refresh the page.');
      console.error('Razorpay script not loaded');
    }

    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login to purchase this material.',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [user, toast, navigate]);

  const handlePay = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!studyMaterialId || Number.isNaN(studyMaterialId)) {
      setError('Invalid material ID');
      toast({
        title: 'Invalid material',
        description: 'Study material ID is invalid.',
        variant: 'destructive',
      });
      return;
    }

    if (typeof window.Razorpay === 'undefined') {
      setError('Payment system not available. Please refresh the page.');
      toast({
        title: 'Payment Error',
        description: 'Payment system not loaded. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[Payment] Creating order for material:', studyMaterialId);

      const order = await createStudyMaterialOrder(studyMaterialId);

      console.log('[Payment] Order created:', order);

      setMaterialTitle(order.studyMaterial?.title || null);
      setAmount(order.amount);

      const options = {
        key: order.keyId,
        amount: order.amount * 100,
        currency: order.currency,
        name: 'Unchi Udaan',
        description: order.studyMaterial?.title || 'Study Material',
        order_id: order.orderId,
        prefill: {
          name: user.name || 'User',
          email: user.email || '',
        },
        theme: { color: '#3b82f6' },
        handler: async (response: any) => {
          try {
            console.log('[Payment] Payment successful, verifying...');
            
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast({
              title: 'Payment Successful! 🎉',
              description: 'You now have access to this material.',
            });

            console.log('[Payment] Redirecting to materials page...');

            // Redirect with timestamp to trigger refetch
            setTimeout(() => {
              navigate('/materials?t=' + Date.now());
            }, 1500);
          } catch (err: any) {
            console.error('[Payment] Verification error:', err);
            setError(err?.response?.data?.message || 'Verification failed');
            toast({
              title: 'Verification failed',
              description:
                err?.response?.data?.message ||
                'Payment succeeded but verification failed. Please contact support.',
              variant: 'destructive',
            });
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            console.log('[Payment] Payment cancelled by user');
            toast({
              title: 'Payment cancelled',
              description: 'You can try again anytime.',
            });
          },
        },
      };

      console.log('[Payment] Opening Razorpay checkout...');
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('[Payment] Error:', error);
      setLoading(false);
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to initialize payment';
      setError(errorMessage);
      
      toast({
        title: 'Payment error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-muted/30">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Study Material Payment</CardTitle>
          <CardDescription>
            Secure payment powered by Razorpay
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {materialTitle && amount !== null ? (
            <>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  You are purchasing:
                </p>
                <p className="font-semibold text-lg">{materialTitle}</p>
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">
                  ₹{amount.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  (one-time payment)
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Click pay to fetch latest price and start checkout.
            </p>
          )}

          <Button
            className="w-full"
            onClick={handlePay}
            disabled={loading || !user || typeof window.Razorpay === 'undefined'}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay with Razorpay'
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            🔒 Secure payment • All transactions are encrypted
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
