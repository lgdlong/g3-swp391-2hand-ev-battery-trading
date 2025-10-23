import { api } from '@/lib/axios';
import { getAuthHeaders } from '@/lib/auth';
import type {
  FeeTier,
  CreateFeeTierDto,
  UpdateFeeTierDto,
  DeleteFeeTierResponse,
} from '@/types/api/fee-tier';

// Re-export types for backward compatibility
export type { FeeTier, CreateFeeTierDto, UpdateFeeTierDto, DeleteFeeTierResponse };

/**
 * Get all fee tiers
 * Requires authentication token in headers
 * Admin access required
 */
export async function getAllFeeTiers(): Promise<FeeTier[]> {
  const { data } = await api.get<FeeTier[]>('/settings/fee-tiers', {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Get a fee tier by ID
 * Requires authentication token in headers
 * Admin access required
 * @param id - Fee tier ID
 */
export async function getFeeTierById(id: number): Promise<FeeTier> {
  const { data } = await api.get<FeeTier>(`/settings/fee-tiers/${id}`, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Create a new fee tier
 * Requires authentication token in headers
 * Admin access required
 * @param payload - Fee tier creation data
 */
export async function createFeeTier(payload: CreateFeeTierDto): Promise<FeeTier> {
  const { data } = await api.post<FeeTier>('/settings/fee-tiers', payload, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Update a fee tier by ID
 * Requires authentication token in headers
 * Admin access required
 * @param id - Fee tier ID
 * @param payload - Fee tier update data
 */
export async function updateFeeTier(id: number, payload: UpdateFeeTierDto): Promise<FeeTier> {
  const { data } = await api.put<FeeTier>(`/settings/fee-tiers/${id}`, payload, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Delete a fee tier by ID
 * Requires authentication token in headers
 * Admin access required
 * @param id - Fee tier ID
 */
export async function deleteFeeTier(id: number): Promise<DeleteFeeTierResponse> {
  const { data } = await api.delete<DeleteFeeTierResponse>(`/settings/fee-tiers/${id}`, {
    headers: getAuthHeaders(),
  });
  return data;
}
