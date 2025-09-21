# Frontend Folder Structure

## `components/`

- Chứa **React components tái sử dụng** trong UI.
- Có thể chia nhỏ thành subfolder theo feature hoặc loại component (`ui/`, `layout/`, `forms/`, …).
- Ví dụ:
  - `Button.tsx`
  - `Navbar.tsx`
  - `Sidebar.tsx`

---

## `config/`

- Chứa các **cấu hình tĩnh** hoặc hằng số dùng chung.
- Ví dụ:
  - `env.ts` (đọc biến môi trường)
  - `routes.ts` (map URL/route)
  - `theme.ts` (cấu hình theme/tailwind tokens)

---

## `hooks/`

- Chứa các **custom React hooks** dùng chung.
- Ví dụ:
  - `useAuth.ts` (hook quản lý authentication state)
  - `useDebounce.ts` (hook debounce input)
  - `useFetch.ts` (fetch dữ liệu từ API)

---

## `lib/`

- Chứa **logic cốt lõi** và các service kết nối bên ngoài (API, Supabase, Auth…).
- Đây là nơi bạn nên đặt **`api/` folder** để gom các hàm gọi backend.
- Ví dụ:
  - `/api/tutorialApi.ts`
  - `/api/productApi.ts`
  - `supabaseClient.ts`
  - `auth.ts`

---

## `public/`

- Chứa **tài nguyên tĩnh** được serve trực tiếp: ảnh, favicon, fonts, JSON tĩnh.
- Truy cập bằng `/` URL.
- Ví dụ: `/logo.png` → `http://localhost:3000/logo.png`

---

## `types/`

- Chứa **TypeScript type & interface** dùng toàn project.
- Dùng để tránh lặp lại type trong nhiều file.
- Ví dụ:
  - `tutorial.ts`
  - `user.ts`
  - `api.ts`

---

## `utils/`

- Chứa các **helper function thuần logic**, không phụ thuộc domain.
- Chỉ gồm hàm tiện ích tái sử dụng nhiều chỗ.
- Ví dụ:
  - `formatDate.ts`
  - `slugify.ts`
  - `clsx.ts` (combine classNames)

---

## `validations/`

- Chứa **schema validation** (zod, yup, joi…) cho form và dữ liệu.
- Dùng chung cho frontend (client-side) và có thể tái sử dụng ở backend nếu share code.
- Ví dụ:
  - `loginSchema.ts`
  - `registerSchema.ts`
  - `tutorialSchema.ts`
