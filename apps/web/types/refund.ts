/**
 * Types for refund management based on backend DTOs
 */
export interface RefundCase {
  id: string;
  postId: string;
  accountId: number;
  scenario: 'CANCEL_EARLY' | 'CANCEL_LATE' | 'EXPIRED' | 'FRAUD_SUSPECTED';
  policyRatePercent: number;
  amountOriginal: string;
  amountRefund: string;
  status: 'PENDING' | 'REFUNDED' | 'FAILED' | 'REJECTED';
  reason?: string | null;
  walletTransactionId?: number | null;
  refundedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  // Populated relations from backend
  account?: {
    id: number;
    email: string;
    fullName?: string;
  };
  post?: {
    id: string;
    title: string;
  };
}

export interface AdminDecideRefundPayload {
  decision: 'approve' | 'reject';
  adminNote?: string;
  refundPercentage?: number;
}

export interface AdminDecideRefundResponse {
  success: boolean;
  message: string;
  refundId: string;
  decision: 'approve' | 'reject';
  amountRefunded?: number;
  walletTransactionId?: number;
}
