/**
 * Refund Policy type definitions
 */

export interface RefundPolicy {
  id: number;
  cancelEarlyRate: string;
  expiredRate: string;
  fraudSuspectedRate: string;
  holdDays: number;
  autoRefundAfterDays: number;
  updatedAt: string;
}

export interface UpdateRefundPolicyDto {
  cancelEarlyRate: number;
  expiredRate: number;
  fraudSuspectedRate: number;
  holdDays: number;
  autoRefundAfterDays: number;
}

export interface DeleteRefundPolicyResponse {
  message: string;
}
