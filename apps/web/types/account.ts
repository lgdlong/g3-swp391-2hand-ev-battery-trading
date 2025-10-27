// types/account.ts
import { AccountRole, AccountStatus } from '@/types/enums/account-enum';

/** UI-focused account interface for display components */
export interface AccountUI {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  status: AccountStatus;
  role: AccountRole;
  createdAt: string;
  updatedAt: string;
}

/** Legacy Account interface (kept for existing code) */
export interface Account {
  id: number;
  email: string | null;
  phone: string | null;
  fullName: string;
  avatarUrl: string | null;
  status: AccountStatus;
  role: AccountRole;
  coins: number;
  createdAt: string; // hoặc Date, nhưng API thường trả ISO string
  updatedAt: string;
}

export interface CreateAccountDto {
  email: string | null;
  phone: string | null;
  password: string;
  fullName: string;
}
