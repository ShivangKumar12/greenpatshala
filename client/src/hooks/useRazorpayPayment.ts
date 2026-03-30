// client/src/hooks/useRazorpayPayment.ts
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  createCourseOrder,
  createQuizOrder,
  createStudyMaterialOrder,
  verifyPayment,
  CreateOrderResponse,
} from '@/services/paymentApi';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type ItemType = 'course' | 'quiz' | 'study-material';

interface PurchaseOptions {
  itemType: ItemType;
  itemId: number;
  userName: string;
  userEmail: string;
  couponCode?: string;
  onSuccess?: () => void;
}

export const useRazorpayPayment = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const initOrder = async (
    itemType: ItemType,
    itemId: number,
    couponCode?: string
  ): Promise<CreateOrderResponse> => {
    if (itemType === 'course') {
      return await createCourseOrder(itemId, couponCode);
    }
    if (itemType === 'quiz') {
      return await createQuizOrder(itemId, couponCode);
    }
    return await createStudyMaterialOrder(itemId, couponCode);
  };

  const startPayment = async ({
    itemType,
    itemId,
    userName,
    userEmail,
    couponCode,
    onSuccess,
  }: PurchaseOptions) => {
    try {
      setLoading(true);

      const order = await initOrder(itemType, itemId, couponCode);

      const description =
        order.course?.title || order.quiz?.title || order.studyMaterial?.title || 'Purchase';

      const options = {
        key: order.keyId,
        amount: order.amount * 100,
        currency: order.currency,
        name: 'Unchi Udaan',
        description,
        order_id: order.orderId,
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: '#3b82f6',
        },
        handler: async (response: any) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast({
              title: 'Payment Successful',
              description: 'Access granted to your purchase.',
            });

            onSuccess?.();
          } catch (err: any) {
            toast({
              title: 'Verification failed',
              description:
                err?.response?.data?.message || 'Please contact support.',
              variant: 'destructive',
            });
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast({
              title: 'Payment cancelled',
              description: 'You can try again anytime.',
            });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      setLoading(false);
      toast({
        title: 'Payment error',
        description:
          error?.response?.data?.message || 'Failed to initialize payment.',
        variant: 'destructive',
      });
    }
  };

  return { startPayment, loading };
};
