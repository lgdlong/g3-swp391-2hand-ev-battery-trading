import { AccountRole } from '../../../shared/enums/account-role.enum';

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  account: {
    id: number;
    email?: string;
    phone?: string;
    role: AccountRole;
    fullName: string;
    avatarUrl?: string;
  };
}
