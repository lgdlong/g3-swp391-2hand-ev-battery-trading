import { AccountRole } from '../../../shared/enums/account-role.enum';

export interface JwtPayload {
  sub: number; // userId
  email: string | null; // optional - nếu user đăng nhập bằng email
  phone: string | null; // optional - nếu user đăng nhập bằng số điện thoại
  role: AccountRole;
  provider?: string | null;
}
