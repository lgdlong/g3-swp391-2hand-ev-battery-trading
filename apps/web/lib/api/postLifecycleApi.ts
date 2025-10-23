import { api } from '@/lib/axios';
import { getAuthHeaders } from '@/lib/auth';
import type {
  PostLifecycle,
  UpdatePostLifecycleDto,
  DeletePostLifecycleResponse,
} from '@/types/api/post-lifecycle';

// Re-export types for backward compatibility
export type { PostLifecycle, UpdatePostLifecycleDto, DeletePostLifecycleResponse };

/**
 * Get post lifecycle configuration
 * Requires authentication token in headers
 * Admin access required
 * Returns array with single configuration (ID: 1)
 */
export async function getPostLifecycle(): Promise<PostLifecycle[]> {
  const { data } = await api.get<PostLifecycle[]>('/settings/post-lifecycle', {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Get post lifecycle configuration by ID
 * Requires authentication token in headers
 * Admin access required
 * @param id - Post lifecycle configuration ID (should be 1)
 */
export async function getPostLifecycleById(id: number): Promise<PostLifecycle> {
  const { data } = await api.get<PostLifecycle>(`/settings/post-lifecycle/${id}`, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Update post lifecycle configuration
 * Requires authentication token in headers
 * Admin access required
 * @param id - Post lifecycle configuration ID (should be 1)
 * @param payload - Post lifecycle update data
 */
export async function updatePostLifecycle(
  id: number,
  payload: UpdatePostLifecycleDto,
): Promise<PostLifecycle> {
  const { data } = await api.put<PostLifecycle>(`/settings/post-lifecycle/${id}`, payload, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Delete post lifecycle configuration
 * Requires authentication token in headers
 * Admin access required
 * @param id - Post lifecycle configuration ID (should be 1)
 */
export async function deletePostLifecycle(id: number): Promise<DeletePostLifecycleResponse> {
  const { data } = await api.delete<DeletePostLifecycleResponse>(`/settings/post-lifecycle/${id}`, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Get the single post lifecycle configuration (convenience function)
 * Since there's only one configuration with ID 1, this function gets it directly
 */
export async function getSinglePostLifecycle(): Promise<PostLifecycle> {
  const configurations = await getPostLifecycle();
  if (configurations.length === 0) {
    throw new Error('No post lifecycle configuration found');
  }
  const config = configurations[0];
  if (!config) {
    throw new Error('No post lifecycle configuration found');
  }
  return config;
}

/**
 * Update the single post lifecycle configuration (convenience function)
 * Since there's only one configuration with ID 1, this function updates it directly
 */
export async function updateSinglePostLifecycle(
  payload: UpdatePostLifecycleDto,
): Promise<PostLifecycle> {
  return updatePostLifecycle(1, payload);
}

/**
 * Delete the single post lifecycle configuration (convenience function)
 * Since there's only one configuration with ID 1, this function deletes it directly
 */
export async function deleteSinglePostLifecycle(): Promise<DeletePostLifecycleResponse> {
  return deletePostLifecycle(1);
}
