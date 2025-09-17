import { SetMetadata } from '@nestjs/common';
import { AccountRole } from '../../shared/enums/account-role.enum';
import { ROLES_KEY } from '../../shared/constants';

export const Roles = (...roles: AccountRole[]) => SetMetadata(ROLES_KEY, roles);
