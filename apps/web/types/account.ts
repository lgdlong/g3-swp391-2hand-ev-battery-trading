// types/account.ts
import { AccountRole, AccountStatus } from '@/types/enums/account-enum';

export interface Account {
  id: number;
  email: string | null;
  phone: string | null;
  // passwordHashed: string; // ⚠️ thường frontend không cần field này
  fullName: string;
  avatarUrl: string | null;
  status: AccountStatus;
  role: AccountRole;
  createdAt: string; // hoặc Date, nhưng API thường trả ISO string
  updatedAt: string;
}

export interface CreateAccountDto {
  email: string | null;
  phone: string | null;
  password: string;
  fullName: string;
}
