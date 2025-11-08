import { api } from '@/lib/axios';
import { getAuthHeaders } from '../auth';
import { RefundCase, AdminDecideRefundPayload, AdminDecideRefundResponse } from '@/types/refund';

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
