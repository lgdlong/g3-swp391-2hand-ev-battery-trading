import { AccountRole } from '../../../shared/enums/account-role.enum';
import { AccountStatus } from '../../../shared/enums/account-status.enum';

export class SafeAccountDto {
  id!: number;
  email!: string | null;
  phone!: string | null;
  fullName!: string;
  avatarUrl!: string | null;
  status!: AccountStatus;
  role!: AccountRole;
  createdAt!: Date;
  updatedAt!: Date;
}
