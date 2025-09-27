import type { Account, CreateAccountDto } from '@/types/account';
import { api } from '@/lib/axios';
import { getAuthHeaders } from '../auth';

export async function createAccount(payload: CreateAccountDto): Promise<Account> {
  const { data } = await api.post<Account>('/accounts', payload);
  return data;
}

/**
 * Get current user profile information
 * Requires authentication token in headers
 */
export async function getCurrentUser(): Promise<Account> {
  const { data } = await api.get<Account>('/accounts/me', {
    headers: getAuthHeaders(),
  });
  return data;
}

// // Ví dụ cho api cần token
// export async function createCategory(body: CategoryCreate): Promise<Category> {
//   const { data } = await api.post<Category>('/categories', body, {
//     headers: getAuthHeaders(), // 👈 dùng lib/auth.ts ở đây
//   });
//   return data;
// }
