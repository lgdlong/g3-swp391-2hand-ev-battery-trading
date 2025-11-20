# 🔐 Tài Liệu Logic Login và UI Trang Đăng Nhập

## 📍 Vị Trí Các File

### Frontend (UI & Logic)

#### 1. **UI Trang Login**
📁 `apps/web/app/(auth)/login/page.tsx`
- **Mô tả**: Component chính của trang đăng nhập
- **Chức năng**:
  - Form đăng nhập với email/phone + password
  - Toggle hiển thị/ẩn mật khẩu
  - Button đăng nhập bằng Google OAuth
  - Link đến trang đăng ký và quên mật khẩu
  - Validation form với Zod
  - Xử lý submit và redirect sau khi login thành công

#### 2. **Validation Schema**
📁 `apps/web/validations/login-schema.ts`
- **Mô tả**: Schema validation cho form login
- **Validation rules**:
  - `identifier`: Email hoặc số điện thoại (tối thiểu 1 ký tự)
  - `password`: Mật khẩu (tối thiểu 1 ký tự)
  - Custom validation: Kiểm tra format email hoặc số điện thoại hợp lệ

#### 3. **API Client**
📁 `apps/web/lib/api/authApi.ts`
- **Mô tả**: Functions gọi API login
- **Functions**:
  - `loginApi()`: Gọi POST `/auth/login` với credentials
  - `getGoogleLoginUrl()`: Lấy URL Google OAuth
  - `initiateGoogleLogin()`: Redirect đến Google OAuth

#### 4. **Auth Context**
📁 `apps/web/lib/auth-context.tsx`
- **Mô tả**: Context quản lý authentication state
- **Chức năng**:
  - `login()`: Lưu token và user data vào localStorage, update state
  - `logout()`: Xóa token và user data
  - `refreshUser()`: Fetch lại thông tin user từ API
  - `isLoggedIn`, `user`, `userRole`: State hiện tại

---

### Backend (API & Logic)

#### 1. **Auth Controller**
📁 `apps/api/src/modules/auth/auth.controller.ts`
- **Mô tả**: Controller xử lý các endpoints authentication
- **Endpoints**:
  - `POST /auth/login`: Đăng nhập với email/phone + password
  - `GET /auth/google`: Bắt đầu Google OAuth flow
  - `GET /auth/google-redirect`: Callback từ Google OAuth

#### 2. **Auth Service**
📁 `apps/api/src/modules/auth/auth.service.ts`
- **Mô tả**: Business logic xử lý authentication
- **Methods**:
  - `validateUser()`: Validate credentials và tạo JWT tokens
  - `handleGoogleLogin()`: Xử lý Google OAuth login
  - `signTokens()`: Tạo access token và refresh token

#### 3. **DTOs (Data Transfer Objects)**
📁 `apps/api/src/modules/auth/dto/`
- **LoginRequestDto**: Request body cho login
  - `identifier`: Email hoặc số điện thoại
  - `password`: Mật khẩu (tối thiểu 6 ký tự)
- **LoginResponse**: Response sau khi login thành công
  - `accessToken`: JWT access token
  - `refreshToken`: JWT refresh token (optional)
  - `account`: Thông tin tài khoản

---

## 🔄 Flow Đăng Nhập

### 1. **Flow Đăng Nhập Thông Thường (Email/Phone + Password)**

```
┌─────────────┐
│   User      │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Nhập email/phone + password
       │    Submit form
       ▼
┌─────────────────────────────────────┐
│  apps/web/app/(auth)/login/page.tsx │
│  - Validate form (Zod)              │
│  - Call loginMutation.mutate()      │
└──────────────┬──────────────────────┘
               │
               │ 2. Call loginApi()
               ▼
┌─────────────────────────────────────┐
│  apps/web/lib/api/authApi.ts        │
│  - POST /auth/login                  │
│  - Body: { identifier, password }    │
└──────────────┬──────────────────────┘
               │
               │ 3. HTTP Request
               ▼
┌─────────────────────────────────────┐
│  apps/api/src/modules/auth/          │
│  auth.controller.ts                  │
│  - POST /auth/login                  │
│  - Receive LoginRequestDto           │
└──────────────┬──────────────────────┘
               │
               │ 4. Call authService.validateUser()
               ▼
┌─────────────────────────────────────┐
│  apps/api/src/modules/auth/          │
│  auth.service.ts                     │
│  - validateUser()                    │
│    ├─ Find account by email/phone   │
│    ├─ Check account exists           │
│    ├─ Validate account status        │
│    ├─ Compare password (bcrypt)     │
│    ├─ Create JWT payload            │
│    └─ Sign tokens (access + refresh) │
└──────────────┬──────────────────────┘
               │
               │ 5. Return LoginResponse
               ▼
┌─────────────────────────────────────┐
│  auth.controller.ts                 │
│  - Set refresh_token cookie          │
│  - Return { accessToken, account }   │
└──────────────┬──────────────────────┘
               │
               │ 6. Response
               ▼
┌─────────────────────────────────────┐
│  login/page.tsx                      │
│  onSuccess callback:                 │
│  ├─ Save accessToken to localStorage │
│  ├─ Call login() from auth-context   │
│  ├─ Redirect based on role:          │
│  │   - Admin → /admin                │
│  │   - User → /                      │
│  └─ Show success toast               │
└─────────────────────────────────────┘
```

### 2. **Flow Đăng Nhập Google OAuth**

```
┌─────────────┐
│   User      │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Click "Đăng nhập bằng Google"
       ▼
┌─────────────────────────────────────┐
│  login/page.tsx                      │
│  - handleGoogleLogin()               │
│  - Call initiateGoogleLogin()        │
└──────────────┬──────────────────────┘
               │
               │ 2. Redirect to Google
               ▼
┌─────────────────────────────────────┐
│  Google OAuth                        │
│  - User authorizes                   │
│  - Redirect back to callback          │
└──────────────┬──────────────────────┘
               │
               │ 3. GET /auth/google-redirect
               ▼
┌─────────────────────────────────────┐
│  auth.controller.ts                 │
│  - googleAuthRedirect()              │
│  - Call authService.handleGoogleLogin()│
└──────────────┬──────────────────────┘
               │
               │ 4. Process Google profile
               ▼
┌─────────────────────────────────────┐
│  auth.service.ts                     │
│  - handleGoogleLogin()               │
│    ├─ Validate Google profile        │
│    ├─ Upsert account in DB           │
│    ├─ Patch missing fields           │
│    ├─ Check account status           │
│    └─ Sign tokens                    │
└──────────────┬──────────────────────┘
               │
               │ 5. Redirect với access_token
               ▼
┌─────────────────────────────────────┐
│  Frontend: /google-callback          │
│  - Extract access_token from hash    │
│  - Save to localStorage              │
│  - Update auth context               │
│  - Redirect to home                  │
└─────────────────────────────────────┘
```

---

## 📝 Chi Tiết Implementation

### Frontend - Login Page Component

**File**: `apps/web/app/(auth)/login/page.tsx`

#### Key Features:
1. **Form Management**:
   - Sử dụng React Hook Form với Zod validation
   - Fields: `identifier` (email/phone), `password`
   - Toggle show/hide password

2. **Login Mutation**:
   ```typescript
   const loginMutation = useMutation({
     mutationFn: loginApi,
     onSuccess: (data) => {
       // Save token
       localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
       // Update auth context
       login(data.accessToken, data.account);
       // Redirect based on role
       router.replace(isAdmin ? '/admin' : '/');
     },
     onError: (error) => handleApiError(error, form),
   });
   ```

3. **Google OAuth**:
   - Button redirect đến `/auth/google`
   - Backend xử lý OAuth flow
   - Redirect về `/google-callback` với token

4. **UI Elements**:
   - Card layout với shadow
   - Form fields với validation messages
   - Loading state khi đang login
   - Links: Sign up, Forgot password

---

### Backend - Auth Service

**File**: `apps/api/src/modules/auth/auth.service.ts`

#### Method: `validateUser()`

```typescript
async validateUser(emailOrPhone: string, pass: string): Promise<LoginResponse> {
  // 1. Tìm tài khoản theo email hoặc số điện thoại
  const account = await this.accountsService.findOneByEmailOrPhone(emailOrPhone);
  
  // 2. Kiểm tra tài khoản tồn tại
  if (!account) {
    throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ!');
  }
  
  // 3. Kiểm tra trạng thái (banned?)
  this.validateAccountStatus(account);
  
  // 4. So sánh mật khẩu (bcrypt)
  const isMatch = await comparePassword(pass, account.passwordHashed);
  if (!isMatch) {
    throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ!');
  }
  
  // 5. Tạo JWT payload
  const payload: JwtPayload = {
    sub: account.id,
    email: account.email,
    phone: account.phone,
    role: account.role,
  };
  
  // 6. Sign tokens
  const tokens = await this.signTokens(payload);
  
  // 7. Return response
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    account: { ...account summary ... }
  };
}
```

#### Method: `signTokens()`

```typescript
private async signTokens(payload: JwtPayload) {
  const [at, rt] = await Promise.all([
    // Access token (1 hour)
    this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION_TIME') || '1h',
    }),
    // Refresh token (30 days)
    this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME') || '30d',
    }),
  ]);
  return { accessToken: at, refreshToken: rt };
}
```

---

### Backend - Auth Controller

**File**: `apps/api/src/modules/auth/auth.controller.ts`

#### Endpoint: `POST /auth/login`

```typescript
@Post('login')
async login(
  @Body() dto: LoginRequestDto,
  @Res({ passthrough: true }) res: Response,
): Promise<LoginResponse> {
  // 1. Validate user credentials
  const loginRes = await this.authService.validateUser(
    dto.identifier,
    dto.password,
  );
  
  // 2. Set refresh token in httpOnly cookie
  res.cookie('refresh_token', loginRes.refreshToken, {
    httpOnly: true,
    secure: true, // HTTPS only
    sameSite: 'lax',
    path: '/auth/refresh',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  
  // 3. Return access token and account info
  return {
    accessToken: loginRes.accessToken,
    account: loginRes.account,
  };
}
```

---

## 🔑 Token Management

### Access Token
- **Storage**: `localStorage` (frontend)
- **Expiration**: 1 giờ (configurable via `JWT_EXPIRATION_TIME`)
- **Usage**: Gửi kèm mỗi API request trong header `Authorization: Bearer <token>`
- **Key**: `ACCESS_TOKEN_KEY` constant

### Refresh Token
- **Storage**: HttpOnly cookie (backend sets)
- **Expiration**: 30 ngày
- **Usage**: Dùng để refresh access token khi hết hạn
- **Path**: `/auth/refresh` (chỉ gửi kèm khi gọi endpoint này)

---

## 🎨 UI Components

### Login Form Fields

1. **Identifier Field**:
   - Label: "Email hoặc Số điện thoại"
   - Placeholder: "Nhập email hoặc số điện thoại của bạn"
   - Type: `text`
   - AutoComplete: `username`
   - Validation: Email format hoặc phone format

2. **Password Field**:
   - Label: "Mật khẩu"
   - Placeholder: "Nhập mật khẩu của bạn"
   - Type: `password` (toggleable)
   - AutoComplete: `current-password`
   - Show/Hide button với Eye/EyeOff icons
   - Link "Quên mật khẩu?" bên cạnh label

3. **Submit Button**:
   - Text: "Đăng nhập"
   - Loading state: "Đang đăng nhập..." với spinner
   - Disabled khi đang submit
   - Color: `#048C73` (emerald green)

4. **Google Login Button**:
   - Text: "Đăng nhập bằng Google"
   - Google logo icon
   - Outline variant
   - Redirects to `/auth/google`

---

## 🔒 Security Features

1. **Password Hashing**:
   - Backend sử dụng bcrypt để hash passwords
   - So sánh password với `comparePassword()` helper

2. **JWT Tokens**:
   - Access token: Short-lived (1 hour)
   - Refresh token: Long-lived (30 days), stored in httpOnly cookie
   - Separate secrets cho access và refresh tokens

3. **Account Status Check**:
   - Kiểm tra account không bị banned trước khi login
   - Throw `UnauthorizedException` nếu banned

4. **Input Validation**:
   - Frontend: Zod schema validation
   - Backend: class-validator DTOs

5. **Error Handling**:
   - Generic error message: "Thông tin đăng nhập không hợp lệ!"
   - Không expose thông tin chi tiết về account existence

---

## 📊 Data Flow

### Request Flow
```
User Input → Form Validation → API Call → Backend Validation → Database Query → Token Generation → Response
```

### Response Flow
```
Backend Response → Save Token → Update Auth Context → Fetch Full User Profile → Redirect → Show Success
```

---

## 🧪 Testing Login

### Test Cases

1. **Valid Login**:
   - Input: Valid email/phone + correct password
   - Expected: Success, token saved, redirect to home/admin

2. **Invalid Credentials**:
   - Input: Wrong email/phone or password
   - Expected: Error message, stay on login page

3. **Banned Account**:
   - Input: Valid credentials but account is banned
   - Expected: Error message, login rejected

4. **Google OAuth**:
   - Click Google button → Authorize → Redirect back
   - Expected: Token in URL hash, saved, redirect to home

5. **Form Validation**:
   - Empty fields → Submit
   - Expected: Validation errors shown

---

## 🔗 Related Files

### Frontend
- `apps/web/app/(auth)/login/page.tsx` - Login page UI
- `apps/web/lib/api/authApi.ts` - API client
- `apps/web/lib/auth-context.tsx` - Auth state management
- `apps/web/validations/login-schema.ts` - Form validation
- `apps/web/app/(auth)/google-callback/page.tsx` - Google OAuth callback

### Backend
- `apps/api/src/modules/auth/auth.controller.ts` - Auth endpoints
- `apps/api/src/modules/auth/auth.service.ts` - Auth business logic
- `apps/api/src/modules/auth/dto/login-request.dto.ts` - Request DTO
- `apps/api/src/modules/auth/dto/login-response.dto.ts` - Response DTO
- `apps/api/src/modules/auth/jwt.strategy.ts` - JWT validation strategy

---

## 📝 Notes

- Access token expiration: **1 giờ** (configurable)
- Refresh token expiration: **30 ngày**
- Login supports both **email** and **phone number** as identifier
- Google OAuth flow redirects với token trong URL hash (không query params)
- Refresh token được lưu trong **httpOnly cookie** để bảo mật
- Account status được kiểm tra trước mỗi lần login

---

**Last Updated**: 2025  
**Project**: 2Hand EV Battery Trading Platform

