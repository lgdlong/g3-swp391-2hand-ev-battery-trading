# 📌 Tổng hợp toàn bộ trao đổi & code cuối cùng (Accounts API)

## 1. Vấn đề bạn gặp

* FE gọi `PATCH /accounts/:id` (ban, promote, demote, …) bị `401 Unauthorized` → thiếu JWT.
* Trong `axios.ts` ban đầu chưa gắn `Authorization`.
* Khi thử gắn thủ công `headers: getAuthHeaders()` → đặt sai tham số, axios hiểu nhầm body → vẫn lỗi.
* TypeScript báo lỗi `implicitly has type 'any'` khi khai báo biến không type rõ ràng.

## 2. Giải thích

* **Backend NestJS**

  * Public API (không JWT): `POST /accounts`, `GET /accounts`, `GET /accounts/:id`, `GET /accounts/email/:email`.
  * Yêu cầu JWT: `GET /accounts/me`, `PATCH /accounts/me`, `PATCH /accounts/:id`.
  * Yêu cầu JWT + ADMIN role: `PATCH /accounts/:id/ban|unban|promote|demote`, `DELETE /accounts/:id`.

* **Frontend Next.js**

  * Phải gắn JWT (Authorization header) khi gọi những API có `JwtAuthGuard`.
  * Nếu API có thêm `RolesGuard` (Admin) → token phải thuộc user role = ADMIN.

## 3. Helper auth

```ts
import { ACCESS_TOKEN_KEY } from '@/config/constants';

export function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
}

export function getAuthHeaders() {
  const token = getAccessToken();
  if (!token) throw new Error('Authentication using token required!');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}
```

## 4. Axios instance

```ts
import axios from 'axios';
import { DEFAULT_API_BASE_URL } from '@/config/constants';
import { getAccessToken } from './auth';

export const api = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 15000,
});

// Request interceptor gắn token
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (r) => r,
  (err) => Promise.reject(new Error(err?.response?.data?.message ?? err.message ?? 'Request failed')),
);
```

## 5. Account API client

```ts
import { api } from '@/lib/axios';
import { getAuthHeaders } from '../auth';
import type { Account } from '@/types/account';

// Current user (cần JWT)
export async function getCurrentAccount(): Promise<Account> {
  const { data } = await api.get('/accounts/me', { headers: getAuthHeaders() });
  return data;
}

// Promote
export async function promoteAccount(id: number): Promise<Account> {
  const { data } = await api.patch(`/accounts/${id}/promote`, {}, { headers: getAuthHeaders() });
  return data;
}

// Demote
export async function demoteAccount(id: number): Promise<Account> {
  const { data } = await api.patch(`/accounts/${id}/demote`, {}, { headers: getAuthHeaders() });
  return data;
}

// Ban
export async function banAccount(id: number): Promise<Account> {
  const { data } = await api.patch(`/accounts/${id}/ban`, {}, { headers: getAuthHeaders() });
  return data;
}

// Unban
export async function unbanAccount(id: number): Promise<Account> {
  const { data } = await api.patch(`/accounts/${id}/unban`, {}, { headers: getAuthHeaders() });
  return data;
}
```

## 6. Quy tắc axios params

* `get(url, config)`
* `delete(url, config)`
* `post(url, data, config)`
* `patch(url, data, config)`
* `put(url, data, config)`

👉 Với `patch` hoặc `post` khi không có body → truyền `{}` làm tham số thứ 2.

## 7. TypeScript

* Lỗi `implicitly has type 'any'` khi viết `let pageNum;`.
* Cách sửa: khai báo rõ type.

```ts
let pageNum: number;
// hoặc
let pageNum: number | undefined;
```

---

✅ **Kết luận**:

* FE chỉ cần nhớ endpoint nào có guard thì phải gắn JWT.
* Admin API yêu cầu token có role = ADMIN.
* Axios phải phân biệt đúng tham số để header không bị lạc.
* Luôn gõ type rõ ràng để tránh implicit `any`.
