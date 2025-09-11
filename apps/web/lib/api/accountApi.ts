import type { Account, CreateAccountDto } from '@/types/account';
import { api } from '@/lib/axios';

export async function createAccount(payload: CreateAccountDto): Promise<Account> {
  const { data } = await api.post<Account>('/accounts', payload);
  return data;
}

// // Ví dụ cho api cần token
// export async function createCategory(body: CategoryCreate): Promise<Category> {
//   const { data } = await api.post<Category>('/categories', body, {
//     headers: getAuthHeaders(), // 👈 dùng lib/auth.ts ở đây
//   });
//   return data;
// }
