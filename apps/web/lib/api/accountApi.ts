import type { Account, CreateAccountDto } from '@/types/account';
import { api } from '@/lib/axios';
import { getAuthHeaders } from '@/lib/auth';
// import { getAuthHeaders } from '../auth';

// Update current user profile
export interface UpdateProfileDto {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}

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

export async function updateCurrentUser(payload: UpdateProfileDto): Promise<Account> {
  const { data } = await api.patch<Account>('/accounts/me', payload, {
    headers: getAuthHeaders(),
  });
  return data;
}

// Get all accounts with pagination
export async function getAccounts(limit?: number, offset?: number): Promise<Account[]> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());

  const { data } = await api.get<Account[]>(`/accounts?${params.toString()}`);
  return data;
}

// Get account by ID
export async function getAccountById(id: number): Promise<Account> {
  const { data } = await api.get<Account>(`/accounts/${id}`);
  return data;
}

// Get account by email
export async function getAccountByEmail(email: string): Promise<Account> {
  const { data } = await api.get<Account>(`/accounts/email/${email}`);
  return data;
}

// Update account
export async function updateAccount(id: number, payload: Partial<Account>): Promise<Account> {
  const { data } = await api.patch<Account>(`/accounts/${id}`, payload);
  return data;
}

// Delete account (Admin only)
export async function deleteAccount(id: number): Promise<void> {
  await api.delete(`/accounts/${id}`);
}

// Get current user account
export async function getCurrentAccount(): Promise<Account> {
  const { data } = await api.get<Account>('/accounts/me');
  return data;
}

// Update current user account
export async function updateCurrentAccount(payload: Partial<Account>): Promise<Account> {
  const { data } = await api.patch<Account>('/accounts/me', payload);
  return data;
}


// // Ví dụ cho api cần token
// export async function createCategory(body: CategoryCreate): Promise<Category> {
//   const { data } = await api.post<Category>('/categories', body, {
//     headers: getAuthHeaders(), // 👈 dùng lib/auth.ts ở đây
//   });
//   return data;
// }
