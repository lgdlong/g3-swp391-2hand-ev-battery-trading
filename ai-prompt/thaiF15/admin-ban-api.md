# API Ban/Unban Account (NestJS)

## 1. Controller: API Ban Account

````ts
import { ForbiddenException } from '@nestjs/common';
import { AccountStatus } from '../../shared/enums/account-status.enum';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import type { ReqUser } from 'src/core/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AccountRole.ADMIN) // Chỉ admin mới ban được
@Patch(':id/ban')
@ApiOperation({ summary: 'Ban account theo id (cần quyền admin)' })
@ApiOkResponse({ type: SafeAccountDto, description: 'Account đã bị ban' })
@ApiForbiddenResponse({ description: 'Không thể tự ban chính mình' })
async banAccount(
  @Param('id') id: string,
  @CurrentUser() actor: ReqUser,
): Promise<SafeAccountDto> {
  const targetId = +id;
  if (actor.sub === targetId) {
    throw new ForbiddenException('Bạn không thể tự ban chính mình');
  }
  return this.accountsService.updateStatus(targetId, AccountStatus.BANNED);
}
```ts
import { AccountStatus } from '../../shared/enums/account-status.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AccountRole.ADMIN) // Chỉ admin mới ban được
@Patch(':id/ban')
@ApiOperation({ summary: 'Ban account theo id (cần quyền admin)' })
@ApiOkResponse({ type: SafeAccountDto, description: 'Account đã bị ban' })
async banAccount(@Param('id') id: string): Promise<SafeAccountDto> {
  return this.accountsService.updateStatus(+id, AccountStatus.BANNED);
}
````

---

## 2. Service: cập nhật status

```ts
async updateStatus(id: number, status: AccountStatus): Promise<SafeAccountDto> {
  const account = await this.accountRepo.findOneByOrFail({ id });
  account.status = status;
  await this.accountRepo.save(account);
  return this.toSafeAccountDto(account);
}
```

---

## 3. Enum ví dụ

```ts
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
  INACTIVE = 'INACTIVE',
}
```

---

## 4. API Unban (tuỳ chọn)

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AccountRole.ADMIN)
@Patch(':id/unban')
@ApiOperation({ summary: 'Unban account theo id (cần quyền admin)' })
@ApiOkResponse({ type: SafeAccountDto, description: 'Account đã được unban' })
async unbanAccount(@Param('id') id: string): Promise<SafeAccountDto> {
  return this.accountsService.updateStatus(+id, AccountStatus.ACTIVE);
}
```

👉 Với cách này bạn có 2 API:

* `PATCH /accounts/:id/ban` → đổi trạng thái sang **BANNED**.
* `PATCH /accounts/:id/unban` → bật lại trạng thái sang **ACTIVE**.
