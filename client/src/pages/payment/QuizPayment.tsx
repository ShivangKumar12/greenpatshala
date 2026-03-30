// client/src/pages/payment/QuizPayment.tsx - FIXED
import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/axios"; // ✅ ADDED

declare global {
  interface Window {
    Razorpay?: any;
  }
}

type QuizSummary = {
  id: number;
  title: string;
  originalPrice: number | null;
  discountPrice: number | null;
};

type AppliedCoupon = {
  code: string;
};

export default function QuizPayment() {
  const [match, params] = useRoute("/payment/quiz/:id");
  const quizId = params?.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<QuizSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null
  );
  const [creatingOrder, setCreatingOrder] = useState(false);

  // ✅ FIXED: Load quiz details with apiClient
  useEffect(() => {
    async function loadQuiz() {
      if (!quizId) return;
      try {
        setLoading(true);
        const response = await apiClient.get(`/quizzes/${quizId}`); // ✅ CHANGED

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to load quiz");
        }

        const q = response.data.quiz;
        setQuiz({
          id: q.id,
          title: q.title,
          originalPrice: q.price != null ? Number(q.price) : null,
          discountPrice:
            q.discount_price != null ? Number(q.discount_price) : null,
        });
      } catch (error: any) {
        console.error("Load quiz error:", error);
        toast({
          title: "Failed to load quiz",
          description: error.response?.data?.message || error.message || "Please try again later.", // ✅ CHANGED
          variant: "destructive",
        });
        setLocation("/quizzes");
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [quizId, toast, setLocation]);

  // Load Razorpay SDK
  useEffect(() => {
    if (window.Razorpay) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const basePrice =
    quiz?.discountPrice != null
      ? quiz.discountPrice
      : quiz?.originalPrice != null
      ? quiz.originalPrice
      : 0;

  const handleBack = () => {
    setLocation("/quizzes");
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon({ code: couponCode.trim().toUpperCase() });
  };

  // ✅ FIXED: handlePayNow with apiClient
  const handlePayNow = async () => {
    if (!quizId || !quiz) return;

    if (!window.Razorpay) {
      toast({
        title: "Payment SDK not loaded",
        description: "Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreatingOrder(true);

      // ✅ CHANGED: Create quiz payment order with apiClient
      const response = await apiClient.post(`/payment/quiz/${quizId}/create-order`, {
        couponCode: appliedCoupon?.code || undefined,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create payment order");
      }

      const { keyId, orderId, amount, currency, quiz: quizInfo } = response.data;

      const options = {
        key: keyId,
        amount: Math.round(amount * 100),
        currency,
        name: "Unchi Udaan",
        description: quizInfo.title,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // ✅ CHANGED: Verify payment with apiClient
            const verifyResponse = await apiClient.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              quizId: quizInfo.id,
            });

            if (!verifyResponse.data.success) {
              throw new Error(
                verifyResponse.data.message || "Payment verification failed"
              );
            }

            // ✅ Show success message
            toast({
              title: "Payment successful! 🎉",
              description: "You now have access to this quiz.",
            });

            // ✅ Redirect with full page reload to refresh data
            setTimeout(() => {
              window.location.href = "/quizzes"; // Force refresh
            }, 1500);

          } catch (error: any) {
            console.error("Verify payment error:", error);
            toast({
              title: "Payment verification failed",
              description: error.response?.data?.message || error.message || "Please contact support.", // ✅ CHANGED
              variant: "destructive",
            });
            
            // Also redirect to failure with refresh
            setTimeout(() => {
              window.location.href = "/payment/failure";
            }, 1500);
          }
        },

        modal: {
          ondismiss: function () {
            toast({
              title: "Payment cancelled",
              description: "You can try again whenever you are ready.",
            });
          },
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        notes: {
          quizId: String(quizInfo.id),
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Create order error:", error);
      toast({
        title: "Payment failed to start",
        description: error.response?.data?.message || error.message || "Please try again later.", // ✅ CHANGED
        variant: "destructive",
      });
    } finally {
      setCreatingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Quiz Payment</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleBack}>
              Back to quizzes
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading || !quiz ? (
              <p className="text-sm text-muted-foreground">
                Loading quiz details...
              </p>
            ) : (
              <>
                <div>
                  <h2 className="font-semibold text-lg mb-1">{quiz.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Review the amount and proceed to payment.
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Coupon code</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                    />
                    <Button variant="outline" onClick={handleApplyCoupon}>
                      Apply
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Coupon {appliedCoupon.code} will be validated during
                      payment.
                    </p>
                  )}
                </div>

                <Separator />

                <div className="flex items-center justify-between text-lg">
                  <span className="font-medium">Amount payable</span>
                  <span className="font-bold">
                    ₹{basePrice.toLocaleString()}
                  </span>
                </div>

                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={handlePayNow}
                  disabled={creatingOrder}
                >
                  {creatingOrder ? "Starting payment..." : "Pay Now"}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-2">
                  Secure checkout via Razorpay.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
