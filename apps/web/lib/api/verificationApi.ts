import { api } from '@/lib/axios';
import { getAuthHeaders } from '@/lib/auth';

/**
 * Verification API functions
 * All verification-related API calls are centralized here
 */

/**
 * Request verification for a post (User only - post owner)
 * Sends a verification request to admin for review
 * Requires authentication token in headers
 */
export async function requestPostVerification(id: string): Promise<any> {
  const { data } = await api.post(
    `/verify-post/${id}/request`,
    {},
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

/**
 * Verify a post (Admin only)
 * Approves verification request and marks post as verified
 * Requires authentication token in headers
 */
export async function verifyPost(id: string): Promise<any> {
  const { data } = await api.patch(
    `/verify-post/${id}/approve`,
    {},
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

/**
 * Reject verification request (Admin only)
 * Rejects verification request with required reason
 * Requires authentication token in headers
 */
export async function rejectPostVerification(id: string, reason: string): Promise<any> {
  const { data } = await api.patch(
    `/verify-post/${id}/reject`,
    { rejectReason: reason },
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

/**
 * Get pending verification requests (Admin only)
 * Requires authentication token in headers
 */
export async function getPendingVerificationRequests(): Promise<any[]> {
  try {
    const { data } = await api.get(
      `/verify-post/admin/pending`,
      {
        headers: getAuthHeaders(),
      },
    );
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get rejected verification requests (Admin only)
 * Requires authentication token in headers
 */
export async function getRejectedVerificationRequests(): Promise<any[]> {
  const { data } = await api.get(
    `/verify-post/admin/rejected`,
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

/**
 * Get verification request for a specific post
 * Requires authentication token in headers
 */
export async function getPostVerificationRequest(postId: string): Promise<any> {
  const { data } = await api.get(
    `/verify-post/post/${postId}`,
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}
