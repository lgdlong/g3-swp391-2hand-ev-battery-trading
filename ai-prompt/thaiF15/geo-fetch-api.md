# TinhThanhPho API – FE & NestJS Integration Cheat Sheet

> Mục tiêu: Tổng hợp kiến thức đã làm để dùng lại nhanh khi cần tích hợp **tinhthanhpho.com/api/v1** vào Next.js (FE) và NestJS (BE).

---

## 1) Lựa chọn kiến trúc

### A. FE gọi thẳng (không KEY, chỉ public endpoints)  

* Dùng được khi endpoint **public** (mở CORS hoặc bạn có proxy nội bộ).
* **Base**: `https://tinhthanhpho.com/api/v1`
* **Dữ liệu** bọc trong `{ success, data, metadata }` ⇒ phải **lấy `body.data`**.
* **Path** dùng **code dạng string**:

  * `/provinces`
  * `/provinces/{provinceCode}/districts`
  * `/districts/{districtCode}/wards`
* **CORS**: nếu bị chặn, xử lý bằng **Next.js rewrite/proxy** (phần 3).
* Ưu: Nhanh, không chạm BE/KEY.  Nhược: Phụ thuộc CORS/upstream, khó cache có kiểm soát.

### B. Next.js Route Handler (BFF) – có KEY hoặc không KEY

* `app/api/ttph/[...path]/route.ts` làm proxy.
* Ưu: Giấu KEY (nếu cần), tránh CORS, thêm cache ISR/revalidateTag.
* Nhược: Logic nằm ở Next; nếu đã có NestJS, có 2 nơi xử lý.

### C. NestJS (BE) – chuẩn sản xuất

* FE → **Nest** → Provider.
* Ưu: Kiến trúc sạch, thêm **retry/timeout/cache/limit/logging**; dễ thay provider.
* Nhược: Setup lâu hơn BFF.

---

## 2) FE-only – Code mẫu tối thiểu

### 2.1 Types & client

```ts
export type Province = { code: string; name: string; type?: string };
export type District = { code: string; name: string; type?: string; province_code?: string };
export type Ward     = { code: string; name: string; type?: string; district_code?: string; province_code?: string };

const BASE = "https://tinhthanhpho.com/api/v1";

async function apiGet<T>(path: string, params?: Record<string, any>): Promise<T> {
  // GHÉP PATH an toàn: tránh mất "/api/v1" khi path bắt đầu bằng "/"
  const joined = `${BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const url = new URL(joined);
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });

  const r = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);

  const body = await r.json();
  const data = Array.isArray(body) ? body : body?.data; // wrapper
  if (!data) throw new Error("Invalid payload shape");
  return data as T;
}

export const getProvinces = (limit = 1000) => apiGet<Province[]>("provinces", { limit });
export const getDistricts = (provinceCode: string, limit = 1000) => apiGet<District[]>(`provinces/${provinceCode}/districts`, { limit });
export const getWards = (districtCode: string, limit = 1000) => apiGet<Ward[]>(`districts/${districtCode}/wards`, { limit });
```

### 2.2 Hooks (TanStack Query) – tránh lỗi TS2742

```ts
"use client";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getProvinces, getDistricts, getWards } from "@/lib/tinhthanhpho";
import type { Province, District, Ward } from "@/lib/tinhthanhpho";

type Q<T> = UseQueryResult<T, Error>;

export const useProvinces: () => Q<Province[]> = () =>
  useQuery<Province[], Error>({ queryKey: ["geo","provinces"] as const, queryFn: () => getProvinces(), staleTime: 86_400_000 });

export const useDistricts: (provinceCode?: string) => Q<District[]> = (provinceCode) =>
  useQuery<District[], Error>({ queryKey: ["geo","districts", provinceCode] as const, queryFn: () => getDistricts(provinceCode!), enabled: !!provinceCode, staleTime: 86_400_000 });

export const useWards: (districtCode?: string) => Q<Ward[]> = (districtCode) =>
  useQuery<Ward[], Error>({ queryKey: ["geo","wards", districtCode] as const, queryFn: () => getWards(districtCode!), enabled: !!districtCode, staleTime: 86_400_000 });
```

### 2.3 Component 3 cấp FE

```tsx
"use client";
import { useState } from "react";
import { useProvinces, useDistricts, useWards } from "@/hooks/useGeo";

export default function GeoPickerFE() {
  const [provinceCode, setProvinceCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [wardCode, setWardCode] = useState("");

  const provincesQ = useProvinces();
  const districtsQ = useDistricts(provinceCode || undefined);
  const wardsQ = useWards(districtCode || undefined);

  const provinces = provincesQ.data ?? [];
  const districts = districtsQ.data ?? [];
  const wards = wardsQ.data ?? [];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div>
        <label className="text-sm opacity-80">Tỉnh/Thành</label>
        <select className="rounded-xl border bg-black/20 p-2" value={provinceCode}
          onChange={(e) => { setProvinceCode(e.target.value); setDistrictCode(""); setWardCode(""); }}>
          <option value="">-- Chọn tỉnh --</option>
          {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm opacity-80">Quận/Huyện</label>
        <select className="rounded-xl border bg-black/20 p-2" value={districtCode}
          disabled={!provinceCode || districtsQ.isLoading}
          onChange={(e) => { setDistrictCode(e.target.value); setWardCode(""); }}>
          <option value="">-- Chọn quận/huyện --</option>
          {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm opacity-80">Phường/Xã</label>
        <select className="rounded-xl border bg-black/20 p-2" value={wardCode}
          disabled={!districtCode || wardsQ.isLoading}
          onChange={(e) => setWardCode(e.target.value)}>
          <option value="">-- Chọn phường/xã --</option>
          {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
        </select>
      </div>
    </div>
  );
}
```

---


## 5) Lỗi thường gặp & cách xử lý

* **CORS**: FE gọi trực tiếp → chặn. Dùng **rewrite** hoặc **proxy route handler**.
* **Sai URL**: `new URL("/path", BASE)` ⇒ mất `/api/v1`. Hãy ghép thủ công (strip `/`).
* **502**: Bạn map mọi lỗi thành 502. Log `e.response.status` + `e.response.data` để trả đúng 4xx/5xx.
* **Không unwrap `data`**: Provider trả `{ data: [...] }` ⇒ phải `body.data`.
* **TS2742 (UseQueryResult)**: Ghi rõ kiểu trả về cho hook.
* **Mất leading zero**: Đừng dùng `Number(code)` cho hiển thị; giữ `code` là **string**.

---

## 6) Khuyến nghị vận hành

* **Cache**: TTL 12–24h cho địa lý; nếu scale nhiều instance → dùng **Redis**.
* **Observability**: log timing/err của upstream, tỉ lệ cache hit.
* **Tách lớp**: FE chỉ nói chuyện `/geo/...` nội bộ (qua BFF/Nest). Về sau đổi provider không phải sửa FE.
* **An toàn KEY**: Chỉ đặt KEY ở **server** (Nest/BFF). Không bao giờ đẩy xuống FE.

---

**Done.** Khi cần, copy từng block ở trên để tái sử dụng cho dự án kế tiếp.
