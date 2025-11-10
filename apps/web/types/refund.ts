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

/**
 * Post candidate for refund (từ backend - tương tự Post entity)
 */
export interface RefundCandidatePost {
  id: string;
  title: string;
  status: 'PUBLISHED' | 'ARCHIVED';
  reviewedAt: string;
  createdAt: string;
  updatedAt: string;
  seller: {
    id: number;
    email: string;
    fullName?: string;
  };
  // Backend-calculated refund scenario and rate
  scenario?: 'CANCEL_EARLY' | 'CANCEL_LATE' | 'EXPIRED' | 'FRAUD_SUSPECTED' | 'PENDING';
  refundRate?: number;
}

/**
 * Manual refund response
 */
export interface ManualRefundResponse {
  success: boolean;
  message: string;
  refund?: {
    id: string;
    status: string;
    amountRefund: string;
  };
}
