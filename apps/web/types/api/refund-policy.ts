/**
 * Refund Policy type definitions
 */

export interface RefundPolicy {
  id: number;
  cancelEarlyRate: string;
  cancelLateRate: string;
  expiredRate: string;
  fraudSuspectedRate: string;
  cancelEarlyDaysThreshold: number;
  cancelLateDaysThreshold: number;
  holdDays: number;
  autoRefundAfterDays: number;
  updatedAt: string;
}

export interface UpdateRefundPolicyDto {
  cancelEarlyRate?: number;
  cancelLateRate?: number;
  expiredRate?: number;
  fraudSuspectedRate?: number;
  cancelEarlyDaysThreshold?: number;
  cancelLateDaysThreshold?: number;
  holdDays?: number;
  autoRefundAfterDays?: number;
}

export interface DeleteRefundPolicyResponse {
  message: string;
}
