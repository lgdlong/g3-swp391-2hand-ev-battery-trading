import type { Account, CreateAccountDto } from '@/types/account';
import { api } from '@/lib/axios';
import { getAuthHeaders } from '../auth';
import { AccountRole as RoleEnum, AccountStatus as StatusEnum } from 'types/enums/account-enum'


export async function createAccount(payload: CreateAccountDto): Promise<Account> {
  const { data } = await api.post<Account>('/accounts', payload);
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

// Get account by ID (public)
export async function getAccountById(id: number): Promise<Account> {
  const { data } = await api.get<Account>(`/accounts/${id}`);
  return data;
}

// Get account by email (public)
export async function getAccountByEmail(email: string): Promise<Account> {
  const { data } = await api.get<Account>(`/accounts/email/${email}`);
  return data;
}

// Update account (auth)
export async function updateAccount(id: number, payload: Partial<Account>): Promise<Account> {
  const { data } = await api.patch<Account>(`/accounts/${id}`, payload,{
    headers: getAuthHeaders(),
  });
  return data;
}

// Delete account (Admin only)
export async function deleteAccount(id: number): Promise<void> {
  await api.delete(`/accounts/${id}`,{
    headers: getAuthHeaders(),
  });
}

// Get current user account (auth)
export async function getCurrentAccount(): Promise<Account> {
  const { data } = await api.get<Account>('/accounts/me', {
    headers: getAuthHeaders(),
  });
  return data;
}

// Update current user account (auth)
export async function updateCurrentAccount(payload: Partial<Account>): Promise<Account> {
  const { data } = await api.patch<Account>('/accounts/me', payload,{
    headers: getAuthHeaders(),
  });
  return data;
}

//  promote (admin auth)
export async function promoteAccount(id: number): Promise<Account> {
  const { data } = await api.patch(`/accounts/${id}/promote`, {},{
    headers: getAuthHeaders(),
  });
  return data;
}

// demote (admin auth)
export async function demoteAccount(id: number): Promise<Account> {
  const { data } = await api.patch(`/accounts/${id}/demote`, {},{
    headers: getAuthHeaders(),
  });
  return data;
}

// ban (admin auth)
export async function banAccount(id: number): Promise<Account> {
  const { data } = await api.patch(`/accounts/${id}/ban`, {},{
    headers: getAuthHeaders(),
  });
  return data;
}

// unban (admin auth)
export async function unbanAccount(id: number): Promise<Account> {
  const { data } = await api.patch(`/accounts/${id}/unban`, {},{
    headers: getAuthHeaders(),
  });
  return data;
}

// ===== Helpers tiện dùng trong UI ====
export async function toggleBan(id: number, current: StatusEnum): Promise<Account> {
  return current === StatusEnum.BANNED ? unbanAccount(id) : banAccount(id);
}

export async function setRole(id: number, role: RoleEnum): Promise<Account> {
  if (role === RoleEnum.ADMIN) return promoteAccount(id);
  if (role === RoleEnum.USER)  return demoteAccount(id);
  // fallback: dùng /accounts/:id PATCH thường
  return updateAccount(id, { role });
}


/////////////////////////////////////////////////////////////
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
