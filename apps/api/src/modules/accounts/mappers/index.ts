import { Account } from '../entities/account.entity';
import { SafeAccountDto } from '../dto/safe-account.dto';

export class AccountMapper {
  static toSafeDto(account: Account): SafeAccountDto {
    return {
      id: account.id,
      email: account.email,
      phone: account.phone,
      fullName: account.fullName,
      avatarUrl: account.avatarUrl,
      status: account.status,
      role: account.role,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    } as SafeAccountDto;
  }

  static toSafeDtoArray(accounts: Account[]): SafeAccountDto[] {
    return accounts.map((account) => AccountMapper.toSafeDto(account));
  }
}
