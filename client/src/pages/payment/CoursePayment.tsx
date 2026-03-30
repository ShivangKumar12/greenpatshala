// client/src/pages/payment/CoursePayment.tsx - FIXED WITH API CLIENT
import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/axios'; // ✅ ADD THIS IMPORT

declare global {
  interface Window {
    Razorpay?: any;
  }
}

type CourseSummary = {
  id: number;
  title: string;
  originalPrice: number | null;
  discountPrice: number | null;
};

type AppliedCoupon = {
  code: string;
};

export default function CoursePayment() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [course, setCourse] = useState<CourseSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  // ✅ LOAD COURSE WITH API CLIENT
  useEffect(() => {
    async function loadCourse() {
      if (!id) return;
      try {
        setLoading(true);
        const response = await apiClient.get(`/courses/${id}`); // ✅ USING API CLIENT
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to load course');
        }
        
        const c = response.data.course;
        setCourse({
          id: c.id,
          title: c.title,
          originalPrice: c.originalPrice != null ? Number(c.originalPrice) : null,
          discountPrice: c.discountPrice != null ? Number(c.discountPrice) : null,
        });
      } catch (error: any) {
        console.error('Load course error:', error);
        toast({
          title: 'Failed to load course',
          description: error.response?.data?.message || error.message || 'Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [id, toast]);

  // Load Razorpay script
  useEffect(() => {
    if (window.Razorpay) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const basePrice =
    course?.discountPrice != null
      ? course.discountPrice
      : course?.originalPrice != null
      ? course.originalPrice
      : 0;

  const handleBack = () => {
    if (id) setLocation(`/courses/${id}`);
    else setLocation('/courses');
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon({ code: couponCode.trim().toUpperCase() });
  };

  // ✅ PAYMENT HANDLER WITH API CLIENT
  const handlePayNow = async () => {
    if (!id || !course) return;

    if (!window.Razorpay) {
      toast({
        title: 'Payment SDK not loaded',
        description: 'Please wait a moment and try again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreatingOrder(true);

      // ✅ CREATE ORDER WITH API CLIENT
      const response = await apiClient.post(`/payment/course/${id}/create-order`, {
        couponCode: appliedCoupon?.code || undefined,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create payment order');
      }

      const { keyId, orderId, amount, currency, course: courseInfo } = response.data;

      const options = {
        key: keyId,
        amount: Math.round(amount * 100),
        currency,
        name: 'Unchi Udaan',
        description: courseInfo.title,
        order_id: orderId,
        handler: async function (razorpayResponse: any) {
          try {
            // ✅ VERIFY PAYMENT WITH API CLIENT
            const verifyResponse = await apiClient.post('/payment/verify', {
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
            });

            if (!verifyResponse.data.success) {
              throw new Error(verifyResponse.data.message || 'Payment verification failed');
            }

            toast({
              title: 'Payment Successful! 🎉',
              description: 'You have been enrolled in this course.',
            });
            
            // Redirect to success page or course page
            setTimeout(() => {
              setLocation(`/learn/${id}`);
            }, 1500);
          } catch (error: any) {
            console.error('Verify payment error:', error);
            toast({
              title: 'Payment verification failed',
              description: error.response?.data?.message || error.message || 'Please contact support.',
              variant: 'destructive',
            });
            setLocation('/payment/failure');
          }
        },
        modal: {
          ondismiss: function () {
            toast({
              title: 'Payment cancelled',
              description: 'You can try again whenever you are ready.',
            });
            setCreatingOrder(false);
          },
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes: {
          courseId: String(courseInfo.id),
        },
        theme: {
          color: '#2563eb',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Create order error:', error);
      toast({
        title: 'Payment failed to start',
        description: error.response?.data?.message || error.message || 'Please try again later.',
        variant: 'destructive',
      });
      setCreatingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Course Payment</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleBack}>
              Back to course
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading || !course ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Loading course details...</p>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="font-semibold text-lg mb-1">{course.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Review the amount and proceed to payment.
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Coupon code (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={creatingOrder}
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleApplyCoupon}
                      disabled={creatingOrder}
                    >
                      Apply
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      ✓ Coupon {appliedCoupon.code} will be applied during checkout
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  {course.originalPrice && course.discountPrice && course.originalPrice > course.discountPrice && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Original Price</span>
                      <span className="line-through">₹{course.originalPrice.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-medium">Amount Payable</span>
                    <span className="font-bold text-primary">₹{basePrice.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={handlePayNow}
                  disabled={creatingOrder}
                >
                  {creatingOrder ? 'Starting payment...' : 'Pay Now'}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-2">
                  🔒 Secure checkout via Razorpay
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
