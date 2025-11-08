import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import { getAuthHeaders } from '@/lib/auth';
import { RefundCase, AdminDecideRefundPayload, AdminDecideRefundResponse } from '@/types/refund';

/**
 * Get all refunds
 */
async function getAllRefunds(): Promise<RefundCase[]> {
  const { data } = await api.get<RefundCase[]>('/refunds', {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Get pending refunds (PENDING status)
 */
async function getPendingRefunds(): Promise<RefundCase[]> {
  const { data } = await api.get<RefundCase[]>('/refunds/pending', {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Admin decide on pending refund (approve/reject)
 */
async function adminDecideRefund(
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

/**
 * Query hook: Get all refunds
 */
export function useGetAllRefunds() {
  return useQuery({
    queryKey: ['all-refunds'],
    queryFn: getAllRefunds,
  });
}

/**
 * Query hook: Get pending refunds for admin review
 */
export function useGetPendingRefunds() {
  return useQuery({
    queryKey: ['pending-refunds'],
    queryFn: getPendingRefunds,
  });
}

/**
 * Mutation hook: Admin decide on refund
 */
export function useAdminDecideRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ refundId, payload }: { refundId: string; payload: AdminDecideRefundPayload }) =>
      adminDecideRefund(refundId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['all-refunds'] });
      queryClient.invalidateQueries({ queryKey: ['pending-refunds'] });
      const action = data.decision === 'approve' ? 'approved' : 'rejected';
      toast.success(`Refund ${action} successfully`, {
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to process refund', {
        description: error.message || 'An unexpected error occurred',
        duration: 5000,
      });
    },
  });
}
