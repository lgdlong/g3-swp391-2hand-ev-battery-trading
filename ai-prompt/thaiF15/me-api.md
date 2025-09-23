# Tóm tắt toàn bộ prompt & giải pháp về `/accounts/me` trong NestJS

- https://chatgpt.com/share/68d05af2-70b8-800c-993c-6cfcf36a659a

## 0. Yêu cầu ban đầu của bạn (prompt)

* Hỏi về cách làm `/me` trong NestJS backend.
* Thắc mắc tại sao Swagger không tự lấy Bearer token.
* Gặp lỗi `Invalid credentials`, `Invalid account id: NaN`, `JWT access token required`, body JSON bị 400.
* Hỏi cách update tên, số điện thoại, avatar.
* Phát hiện chưa có `UpdateAccountDto`.
* Hỏi tại sao update không vào DB (do `id = null`).
* Gửi code JWT strategy với `sub` → muốn hiểu tại sao không khớp.

---

## 1. Mục tiêu

Xây dựng API `/accounts/me` trong backend NestJS để:

* **GET**: lấy thông tin tài khoản hiện tại.
* **PATCH**: cập nhật thông tin tài khoản (tên, số điện thoại, avatar, bio).

---

## 2. Thành phần chính

### Entity `Account`

* Chứa field login: `id`, `email`, `password`, `role`, `status`.
* Gộp field profile: `fullName`, `phone`, `avatarUrl`, `bio`.
* Sử dụng `ClassSerializerInterceptor` để ẩn password.

### DTO

* **`UpdateAccountDto`**: định nghĩa field update được phép (optional, validated).
* **`SafeAccountDto`**: response an toàn (không có password).

### Decorator & Guard

* `@CurrentUser()` lấy user từ JWT.
* `JwtAuthGuard` để bảo vệ route.
* `RolesGuard` nếu cần phân quyền.

### JWT Strategy

* Khi login: sign payload `{ sub: account.id, email, role }`.
* Trong `validate`: trả `{ userId: payload.sub, email, role }` để đồng bộ.
* Vấn đề từng gặp: return `{ sub: ... }` thay vì `{ userId: ... }` → `id = null` khi update.

---

## 3. Controller `/accounts`

```ts
@UseGuards(JwtAuthGuard)
@Get('me')
async me(@CurrentUser() user: ReqUser): Promise<SafeAccountDto> {
  return this.accountsService.findMe(user.userId);
}

@UseGuards(JwtAuthGuard)
@Patch('me')
async updateMe(@CurrentUser() user: ReqUser, @Body() dto: UpdateAccountDto): Promise<SafeAccountDto> {
  return this.accountsService.updateMe(user.userId, dto);
}
```

---

## 4. Service

* **findMe**: lấy account theo `userId` → map sang SafeAccountDto.
* **updateMe**:

  * Check `userId` khác null.
  * Dùng `merge + save` để chắc chắn entity được update.

```ts
async updateMe(userId: number, dto: UpdateAccountDto): Promise<SafeAccountDto> {
  const acc = await this.repo.findOneOrFail({ where: { id: userId } });
  this.repo.merge(acc, dto);
  const saved = await this.repo.save(acc);
  return this.toSafeDto(saved);
}
```

---

## 5. Swagger

* `main.ts`:

```ts
.addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
```

* Controller:

```ts
@ApiBearerAuth('access-token')
@ApiTags('Accounts')
```

* Bật `swaggerOptions: { persistAuthorization: true }`.
* **Quan trọng**: Swagger **không tự lấy token từ login response** → phải bấm **Authorize** thủ công và dán token.

---

## 6. Test

### Swagger UI

1. Gọi `POST /auth/login` → copy `access_token`.
2. Bấm **Authorize** (icon ổ khóa góc phải) → dán token.
3. Gọi `GET /accounts/me` hoặc `PATCH /accounts/me`.

### Body mẫu update

```json
{
  "fullName": "Nguyen Van A",
  "phone": "+84 912 345 678",
  "avatarUrl": "https://cdn.example.com/u/avatar.png",
  "bio": "Backend dev • NestJS"
}
```

### cURL

```bash
TOKEN=...
curl http://localhost:8000/accounts/me -H "Authorization: Bearer $TOKEN"

curl -X PATCH http://localhost:8000/accounts/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Nguyen Van A","phone":"+84 912 345 678"}'
```

---

## 7. Các lỗi đã gặp & cách fix

* **401 Invalid credentials**: sai email/password hoặc hash không khớp.
* **Invalid account id: NaN**: route `/me` bị match `:id` hoặc `userId` undefined → fix bằng reorder route và map `userId` đúng từ JWT.
* **JWT access token required**: chưa gửi header Authorization hoặc Swagger chưa Authorize.
* **400 Bad Request JSON**: body sai cú pháp (dấu nháy đơn, dấu phẩy thừa…).
* **Không update**: do `id = null` (validate trả sub thay vì userId), hoặc DTO rỗng vì whitelist.

---

## 8. Kết luận

* Luồng chuẩn: login → lấy token → Authorize trong Swagger → gọi `/accounts/me`.
* Đồng bộ key JWT (`sub` → `userId`).
* DTO bắt buộc phải có để ValidationPipe không lọc hết body.
* Update nên dùng `merge + save` và reload entity mới.
* Swagger không tự lấy token → luôn phải Authorize thủ công.
