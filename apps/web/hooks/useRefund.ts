import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import { getAuthHeaders } from '@/lib/auth';
import { RefundCase, AdminDecideRefundPayload, AdminDecideRefundResponse } from '@/types/refund';
import { getRefundCandidates, manualRefundForPost } from '@/lib/api/refundApi';

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

/**
 * Query hook: Get posts eligible for refund (chờ cron job quét)
 */
export function useGetRefundCandidates() {
  return useQuery({
    queryKey: ['refund-candidates'],
    queryFn: getRefundCandidates,
  });
}

/**
 * Mutation hook: Manual refund for specific post
 */
export function useManualRefundForPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: manualRefundForPost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['refund-candidates'] });
      queryClient.invalidateQueries({ queryKey: ['all-refunds'] });
      toast.success('Manual refund processed', {
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to process manual refund', {
        description: error.message || 'An unexpected error occurred',
        duration: 5000,
      });
    },
  });
}
