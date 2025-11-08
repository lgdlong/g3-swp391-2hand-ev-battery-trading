import { api } from '@/lib/axios';
import { getAuthHeaders } from '../auth';
import {
  RefundCase,
  AdminDecideRefundPayload,
  AdminDecideRefundResponse,
  RefundCandidatePost,
  ManualRefundResponse,
} from '@/types/refund';

/**
 * Get all refunds
 */
export async function getAllRefunds(): Promise<RefundCase[]> {
  const { data } = await api.get<RefundCase[]>('/refunds', {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Get pending refunds (PENDING status)
 */
export async function getPendingRefunds(): Promise<RefundCase[]> {
  const { data } = await api.get<RefundCase[]>('/refunds/pending', {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Get posts eligible for refund (chờ cron job quét)
 */
export async function getRefundCandidates(): Promise<RefundCandidatePost[]> {
  const { data } = await api.get<RefundCandidatePost[]>('/refunds/candidates', {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Manual refund for specific post
 */
export async function manualRefundForPost(postId: string): Promise<ManualRefundResponse> {
  const { data } = await api.post<ManualRefundResponse>(
    `/refunds/${postId}/manual-refund`,
    {},
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

/**
 * Admin decide on pending refund (approve/reject)
 */
export async function adminDecideRefund(
  refundId: string,
  payload: AdminDecideRefundPayload,
): Promise<AdminDecideRefundResponse> {
  const { data } = await api.post<AdminDecideRefundResponse>(
    `/refunds/${refundId}/decide`,
    payload,
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}
