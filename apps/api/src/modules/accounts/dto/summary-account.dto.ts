import { AccountRole } from '../../../shared/enums/account-role.enum';

export class SummaryAccountDto {
  id!: number;
  email?: string;
  phone?: string;
  fullName?: string;
  role!: AccountRole;
  status!: string;
  createdAt!: string;
}
