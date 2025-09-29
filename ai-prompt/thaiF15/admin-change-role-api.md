# Tóm tắt yêu cầu & nội dung trao đổi

**Yêu cầu gốc**: Bạn hỏi cách thiết kế API cho quản lý vai trò (role) và thao tác promote/demote/ban trong module `accounts`, cân nhắc giữa kiểu REST-thuần (`:id/role`) và action-based (`:id/promote`, `:id/demote`, `:id/ban`). Đồng thời muốn tóm tắt prompt + đoạn chat thành markdown.

---

## 1) Hai hướng thiết kế API

### A. Action-based endpoints

* **Ví dụ**: `PATCH /accounts/:id/promote`, `PATCH /accounts/:id/demote`, `PATCH /accounts/:id/ban`
* **Ưu**: Dễ đọc như “lệnh”, nhanh cho các thao tác đặc thù.
* **Nhược**: Không thuần REST (verb trong URL), dễ “nở” endpoint khi có nhiều action.

### B. REST-thuần (resource + method)

* **Ví dụ**:

  * Đổi role: `PATCH /accounts/:id/role` với body `{ role: "ADMIN" }`
  * Đổi status (ban/unban): `PATCH /accounts/:id/status`
  * Lịch sử ban (audit): `POST /accounts/:id/ban-logs` (tạo log), `DELETE /accounts/:id/ban-logs/:banLogId`
* **Ưu**: Chuẩn REST, mở rộng tốt, nhất quán.
* **Nhược**: FE phải biết enum giá trị (USER/MOD/ADMIN...).

> **Kết luận**: Ưu tiên **REST-thuần** để nhất quán. Nếu cần “nút nhanh” Promote/Demote trong UI admin, có thể **bổ sung** action-based như helper (map nội bộ về logic đổi role).

---

## 2) Cấu trúc enum & DTO (NestJS)

```ts
// shared/enums
export enum AccountRole { USER = 'USER', MOD = 'MOD', ADMIN = 'ADMIN' }
export enum AccountStatus { ACTIVE = 'ACTIVE', BANNED = 'BANNED' }
```

```ts
// dto/update-role.dto.ts
import { IsEnum } from 'class-validator';
import { AccountRole } from '../../shared/enums/account-role.enum';

export class UpdateRoleDto {
  @IsEnum(AccountRole)
  role: AccountRole; // role được truyền trong body
}
```

```ts
// dto/update-status.dto.ts
import { IsEnum, IsOptional, IsISO8601, IsString, MaxLength } from 'class-validator';
import { AccountStatus } from '../../shared/enums/account-status.enum';

export class UpdateStatusDto {
  @IsEnum(AccountStatus)
  status: AccountStatus; // ACTIVE | BANNED

  @IsOptional()
  @IsISO8601()
  endsAt?: string | null; // null = ban vĩnh viễn

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
```

```ts
// dto/create-ban-log.dto.ts
import { IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';
export class CreateBanAccountLogDto {
  @IsOptional() @IsISO8601() endsAt?: string | null;
  @IsOptional() @IsString() @MaxLength(255) reason?: string;
}
```

---

## 3) Controller (REST-thuần) & sub-resources

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Roles(AccountRole.ADMIN)
  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.accountsService.updateRole(+id, dto.role);
  }

  @Roles(AccountRole.ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.accountsService.updateStatus(+id, dto);
  }

  // Sub-resource: ban logs (audit/history)
  @Roles(AccountRole.ADMIN)
  @Post(':id/ban-logs')
  createBanLog(@Param('id') id: string, @Body() dto: CreateBanAccountLogDto) {
    return this.accountsService.createBanLog(+id, dto);
  }

  @Roles(AccountRole.ADMIN)
  @Delete(':id/ban-logs/:banLogId')
  deleteBanLog(@Param('id') id: string, @Param('banLogId') banLogId: string) {
    return this.accountsService.deleteBanLog(+id, +banLogId);
  }
}
```

> **Giải thích “thuần REST”**: Không dùng verb trong path; biểu đạt ý định qua HTTP method (`PATCH` cập nhật phần, `POST` tạo tài nguyên con, `DELETE` xoá tài nguyên con).

---

## 4) Service – ý chính

```ts
async updateRole(id: number, role: AccountRole) {
  const acc = await this.accountRepo.findOneByOrFail({ id });
  acc.role = role; // gán role đích từ body
  await this.accountRepo.save(acc);
  return this.toSafeAccountDto(acc);
}

async updateStatus(id: number, dto: UpdateStatusDto) {
  const acc = await this.accountRepo.findOneByOrFail({ id });
  acc.status = dto.status;

  if (dto.status === AccountStatus.BANNED) {
    const log = this.banLogRepo.create({
      userId: id,
      reason: dto.reason ?? null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
    });
    await this.banLogRepo.save(log);
  }

  await this.accountRepo.save(acc);
  return this.toSafeAccountDto(acc);
}

async createBanLog(id: number, dto: CreateBanAccountLogDto) {
  await this.accountRepo.findOneByOrFail({ id });
  const log = this.banLogRepo.create({
    userId: id,
    reason: dto.reason ?? null,
    endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
  });
  return this.banLogRepo.save(log);
}

async deleteBanLog(id: number, banLogId: number) {
  const log = await this.banLogRepo.findOneByOrFail({ id: banLogId, userId: id });
  await this.banLogRepo.remove(log);
  return { ok: true };
}
```

---

## 5) FE gọi API – hai kiểu dùng song song

### (1) REST-thuần – truyền role/status trong body

```ts
await fetch(`/api/accounts/${id}/role`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ role: 'ADMIN' }),
});

await fetch(`/api/accounts/${id}/status`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'BANNED', reason: 'spam', endsAt: '2025-12-31T23:59:59Z' }),
});
```

### (2) Action-based helper – Promote/Demote nhanh (tuỳ chọn)

```ts
await fetch(`/api/accounts/${id}/promote`, { method: 'PATCH' });
await fetch(`/api/accounts/${id}/demote`, { method: 'PATCH' });
```

> Nội bộ BE map về logic thăng/hạ cấp theo bậc (VD: USER → MOD → ADMIN), nhưng vẫn giữ chuẩn REST làm “đường chính”.

---

## 6) FAQ ngắn

* **“Role không rõ truyền sao?”** → FE đọc enum từ docs/Swagger (`@IsEnum(AccountRole)` hiển thị sẵn), hoặc bạn expose endpoint trả về danh sách role hợp lệ.
* **“Có nên chỉ giữ /promote /demote?”** → Có thể, nếu workflow chỉ là tăng/giảm bậc. Nhưng dễ thiếu linh hoạt (không gán trực tiếp được sang bậc bất kỳ).
* **“Ghi log ban ở đâu?”** → Sub-resource `ban-logs` để audit rõ ràng, không trộn vào entity Account.

---

## 7) Gợi ý mở rộng

* **GET /accounts/:id/ban-logs**: xem lịch sử ban.
* **Validation business**: kiểm soát không promote quá trần, không demote dưới đáy.
* **Transaction**: gói `updateStatus` + ghi log trong 1 transaction.
* **Policy**: chỉ cho xoá log nếu chưa hiệu lực hoặc có quyền "revoke".

---

> ✅ **Takeaway**: Dùng **`PATCH /accounts/:id/role`** và **`PATCH /accounts/:id/status`** làm chuẩn REST. Thêm **`/promote` / `/demote`** như phím tắt nếu UI cần thao tác nhanh. FE có thể dùng **cả hai** song song tuỳ ngữ cảnh.
