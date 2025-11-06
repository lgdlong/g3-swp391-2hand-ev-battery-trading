import { api } from './instance';
import type {
  PostPayment,
  CreatePostPaymentDto,
  PostPaymentCheckResponse,
  PostPaymentListResponse,
} from '@/types/post-payment';

const BASE_URL = '/transactions/post-payments';

/**
 * Create a new post payment record
 */
export const createPostPayment = async (data: CreatePostPaymentDto): Promise<PostPayment> => {
  const response = await api.post<PostPayment>(BASE_URL, data);
  return response.data;
};

/**
 * Get post payment by post ID
 */
export const getPostPaymentByPostId = async (postId: string): Promise<PostPayment> => {
  const response = await api.get<PostPayment>(`${BASE_URL}/post/${postId}`);
  return response.data;
};

/**
 * Get all post payments by account ID
 */
export const getPostPaymentsByAccountId = async (accountId: number): Promise<PostPayment[]> => {
  const response = await api.get<PostPayment[]>(`${BASE_URL}/account/${accountId}`);
  return response.data;
};

/**
 * Get all post payments with pagination
 */
export const getAllPostPayments = async (
  page: number = 1,
  limit: number = 10,
): Promise<PostPaymentListResponse> => {
  const response = await api.get<PostPaymentListResponse>(BASE_URL, {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Check if post has been paid for
 */
export const checkPostPayment = async (postId: string): Promise<PostPaymentCheckResponse> => {
  const response = await api.get<PostPaymentCheckResponse>(`${BASE_URL}/check/${postId}`);
  return response.data;
};

/**
 * Delete post payment (use with caution)
 */
export const deletePostPayment = async (postId: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`${BASE_URL}/post/${postId}`);
  return response.data;
};

/**
 * Get my post payments (current user)
 */
export const getMyPostPayments = async (): Promise<PostPayment[]> => {
  const response = await api.get<PostPayment[]>(`${BASE_URL}/my-payments`);
  return response.data;
};
