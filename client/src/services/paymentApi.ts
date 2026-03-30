// client/src/services/paymentApi.ts - WITH USER PAYMENT APIS
import apiClient from '@/lib/axios';

export interface Payment {
  id: number;
  orderId: string;
  transactionId: string;
  paymentId: string | null;
  userName: string;
  userEmail: string;
  itemType: 'course' | 'quiz' | 'study-material';
  itemName: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  paymentMethod: string;
  signature: string | null;
  createdAt: string;
}

export interface PaymentStats {
  totalPayments: number;
  totalRevenue: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
}

export interface GetPaymentsParams {
  status?: 'all' | 'success' | 'pending' | 'failed';
  type?: 'all' | 'course' | 'quiz' | 'study-material';
  search?: string;
  limit?: number;
  offset?: number;
}

export interface GetPaymentsResponse {
  success: boolean;
  payments: Payment[];
  total: number;
  limit: number;
  offset: number;
}

export interface GetStatsResponse {
  success: boolean;
  stats: PaymentStats;
}

/**
 * Get all payments (Admin only)
 */
export const getAllPayments = async (
  params: GetPaymentsParams = {}
): Promise<GetPaymentsResponse> => {
  const queryParams = new URLSearchParams();

  if (params.status && params.status !== 'all') {
    queryParams.append('status', params.status);
  }

  if (params.type && params.type !== 'all') {
    queryParams.append('type', params.type);
  }

  if (params.search) {
    queryParams.append('search', params.search);
  }

  if (params.limit) {
    queryParams.append('limit', params.limit.toString());
  }

  if (params.offset) {
    queryParams.append('offset', params.offset.toString());
  }

  const response = await apiClient.get(`/admin/payments/all?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get payment statistics (Admin only)
 */
export const getPaymentStats = async (): Promise<GetStatsResponse> => {
  const response = await apiClient.get('/admin/payments/stats');
  return response.data;
};

/**
 * Export payments to CSV
 */
export const exportPaymentsCSV = (payments: Payment[]): void => {
  const headers = [
    'Order ID',
    'Transaction ID',
    'Payment ID',
    'Customer Name',
    'Email',
    'Item Type',
    'Item Name',
    'Amount (₹)',
    'Status',
    'Payment Method',
    'Date',
  ];

  const rows = payments.map((payment) => [
    payment.orderId,
    payment.transactionId,
    payment.paymentId || 'N/A',
    payment.userName,
    payment.userEmail,
    payment.itemType,
    payment.itemName,
    payment.amount,
    payment.status,
    payment.paymentMethod,
    new Date(payment.createdAt).toLocaleString('en-IN'),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `unchi-udaan-payments-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Generate payment slip text
 */
export const generatePaymentSlip = (payment: Payment): string => {
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           UNCHI UDAAN
        PAYMENT RECEIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Order ID: ${payment.orderId}
Transaction ID: ${payment.transactionId}
Payment ID: ${payment.paymentId || 'N/A'}
Status: ${payment.status.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CUSTOMER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: ${payment.userName}
Email: ${payment.userEmail}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PURCHASE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Item Type: ${payment.itemType.toUpperCase()}
Item Name: ${payment.itemName}
Amount: ₹${payment.amount.toLocaleString()}
Payment Method: ${payment.paymentMethod}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRANSACTION DATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${new Date(payment.createdAt).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'long',
  })}

${payment.signature ? `\nSignature: ${payment.signature}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thank you for your payment!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();
};

/**
 * Download payment slip as text file
 */
export const downloadPaymentSlip = (payment: Payment): void => {
  const slip = generatePaymentSlip(payment);
  const blob = new Blob([slip], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `payment-slip-${payment.orderId}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Generate printable HTML receipt
 */
export const printPaymentReceipt = (payment: Payment): void => {
  const printWindow = window.open('', '', 'width=800,height=600');
  if (!printWindow) return;

  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Receipt - ${payment.orderId}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #000;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          color: #e74c3c;
        }
        .header h2 {
          margin: 5px 0 0 0;
          font-size: 18px;
          color: #666;
        }
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          margin: 20px 0;
          ${payment.status === 'success'
      ? 'background: #d4edda; color: #155724;'
      : payment.status === 'pending'
        ? 'background: #fff3cd; color: #856404;'
        : 'background: #f8d7da; color: #721c24;'
    }
        }
        .section {
          margin: 30px 0;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .section-title {
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 15px;
          border-bottom: 2px solid #dee2e6;
          padding-bottom: 5px;
        }
        .field {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px dashed #dee2e6;
        }
        .field:last-child {
          border-bottom: none;
        }
        .field-label {
          color: #666;
          font-size: 14px;
        }
        .field-value {
          font-weight: bold;
          font-family: monospace;
        }
        .amount {
          font-size: 32px;
          color: #28a745;
          text-align: center;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #000;
          color: #666;
          font-size: 12px;
        }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎓 UNCHI UDAAN</h1>
        <h2>Payment Receipt</h2>
        <div class="status-badge">${payment.status.toUpperCase()}</div>
      </div>

      <div class="section">
        <div class="section-title">Transaction Information</div>
        <div class="field">
          <span class="field-label">Order ID:</span>
          <span class="field-value">${payment.orderId}</span>
        </div>
        <div class="field">
          <span class="field-label">Transaction ID:</span>
          <span class="field-value">${payment.transactionId}</span>
        </div>
        <div class="field">
          <span class="field-label">Payment ID:</span>
          <span class="field-value">${payment.paymentId || 'N/A'}</span>
        </div>
        <div class="field">
          <span class="field-label">Payment Method:</span>
          <span class="field-value">${payment.paymentMethod}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Customer Information</div>
        <div class="field">
          <span class="field-label">Name:</span>
          <span class="field-value">${payment.userName}</span>
        </div>
        <div class="field">
          <span class="field-label">Email:</span>
          <span class="field-value">${payment.userEmail}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Purchase Details</div>
        <div class="field">
          <span class="field-label">Item Type:</span>
          <span class="field-value">${payment.itemType.toUpperCase()}</span>
        </div>
        <div class="field">
          <span class="field-label">Item Name:</span>
          <span class="field-value">${payment.itemName}</span>
        </div>
        <div class="amount">₹${payment.amount.toLocaleString()}</div>
      </div>

      <div class="section">
        <div class="section-title">Transaction Date</div>
        <div style="text-align: center; padding: 10px 0;">
          <strong>${new Date(payment.createdAt).toLocaleString('en-IN', {
      dateStyle: 'full',
      timeStyle: 'long',
    })}</strong>
        </div>
      </div>

      ${payment.signature
      ? `
        <div class="section">
          <div class="section-title">Signature</div>
          <div class="field-value" style="word-break: break-all; font-size: 11px;">
            ${payment.signature}
          </div>
        </div>
      `
      : ''
    }

      <div class="footer">
        <p><strong>Thank you for your payment!</strong></p>
        <p>For any queries, contact: support@unchiudaan.com</p>
        <p style="margin-top: 20px; font-size: 10px;">
          This is a computer-generated receipt and does not require a signature.
        </p>
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
};

// Delete a payment record (Admin only)
export const deletePayment = async (paymentId: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.delete(`/admin/payments/${paymentId}`);
    return response.data;
  } catch (error: any) {
    console.error('[DELETE PAYMENT ERROR]', error);
    throw error;
  }
};

// --------- USER PAYMENT APIS (COURSE / QUIZ / STUDY MATERIAL) ---------

export interface CreateOrderResponse {
  success: boolean;
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  course?: { id: number; title: string };
  quiz?: { id: number; title: string };
  studyMaterial?: { id: number; title: string };
  coupon?: { id: number; code: string } | null;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Create course payment order
 */
export const createCourseOrder = async (
  courseId: number,
  couponCode?: string
): Promise<CreateOrderResponse> => {
  const response = await apiClient.post(
    `/payment/course/${courseId}/create-order`,
    { couponCode }
  );
  return response.data;
};

/**
 * Create quiz payment order
 */
export const createQuizOrder = async (
  quizId: number,
  couponCode?: string
): Promise<CreateOrderResponse> => {
  const response = await apiClient.post(
    `/payment/quiz/${quizId}/create-order`,
    { couponCode }
  );
  return response.data;
};

/**
 * Create study material payment order
 */
export const createStudyMaterialOrder = async (
  studyMaterialId: number,
  couponCode?: string
): Promise<CreateOrderResponse> => {
  const response = await apiClient.post(
    `/payment/study-material/${studyMaterialId}/create-order`,
    { couponCode }
  );
  return response.data;
};

/**
 * Verify Razorpay payment
 */
export const verifyPayment = async (
  payload: VerifyPaymentPayload
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post('/payment/verify', payload);
  return response.data;
};

