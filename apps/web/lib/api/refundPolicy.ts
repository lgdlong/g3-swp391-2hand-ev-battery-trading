import { api } from '@/lib/axios';
import { getAuthHeaders } from '@/lib/auth';
import type {
  RefundPolicy,
  UpdateRefundPolicyDto,
  DeleteRefundPolicyResponse,
} from '@/types/api/refund-policy';

// Re-export types for backward compatibility
export type { RefundPolicy, UpdateRefundPolicyDto, DeleteRefundPolicyResponse };

/**
 * Get refund policy configuration
 * Requires authentication token in headers
 * Admin access required
 * Returns array with single configuration (ID: 1)
 */
export async function getRefundPolicy(): Promise<RefundPolicy[]> {
  const { data } = await api.get<RefundPolicy[]>('/settings/refund-policies', {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Get refund policy configuration by ID
 * Requires authentication token in headers
 * Admin access required
 * @param id - Refund policy configuration ID (should be 1)
 */
export async function getRefundPolicyById(id: number): Promise<RefundPolicy> {
  const { data } = await api.get<RefundPolicy>(`/settings/refund-policies/${id}`, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Update refund policy configuration
 * Requires authentication token in headers
 * Admin access required
 * @param id - Refund policy configuration ID (should be 1)
 * @param payload - Refund policy update data
 */
export async function updateRefundPolicy(
  id: number,
  payload: UpdateRefundPolicyDto,
): Promise<RefundPolicy> {
  const { data } = await api.put<RefundPolicy>(`/settings/refund-policies/${id}`, payload, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Delete refund policy configuration
 * Requires authentication token in headers
 * Admin access required
 * @param id - Refund policy configuration ID (should be 1)
 */
export async function deleteRefundPolicy(id: number): Promise<DeleteRefundPolicyResponse> {
  const { data } = await api.delete<DeleteRefundPolicyResponse>(`/settings/refund-policies/${id}`, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Get the single refund policy configuration (convenience function)
 * Since there's only one configuration with ID 1, this function gets it directly
 */
export async function getSingleRefundPolicy(): Promise<RefundPolicy> {
  const policies = await getRefundPolicy();
  if (policies.length === 0) {
    throw new Error('No refund policy configuration found');
  }
  const policy = policies[0];
  if (!policy) {
    throw new Error('No refund policy configuration found');
  }
  return policy;
}

/**
 * Update the single refund policy configuration (convenience function)
 * Since there's only one configuration with ID 1, this function updates it directly
 */
export async function updateSingleRefundPolicy(
  payload: UpdateRefundPolicyDto,
): Promise<RefundPolicy> {
  return updateRefundPolicy(1, payload);
}

/**
 * Delete the single refund policy configuration (convenience function)
 * Since there's only one configuration with ID 1, this function deletes it directly
 */
export async function deleteSingleRefundPolicy(): Promise<DeleteRefundPolicyResponse> {
  return deleteRefundPolicy(1);
}
