import { AccountRole } from '@/types/enums/account-enum';

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  account: {
    id: number;
    email?: string;
    phone?: string;
    role: AccountRole; // Assuming AccountRole enum values
    fullName?: string;
    avatarUrl?: string;
  };
}

export interface LoginRequest {
  identifier: string; // người dùng nhập email hoặc số điện thoại
  password: string;
}
