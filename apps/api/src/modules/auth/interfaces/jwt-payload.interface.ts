import { AccountRole } from '../../../shared/enums/account-role.enum';

export interface JwtPayload {
  sub: number; // userId
  role: AccountRole;
  provider?: string;
}
