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

## 3) Né CORS mà vẫn FE-only (không KEY)

### 3.1 Next.js **rewrites** (đơn giản nhất)

```js
// next.config.js
const nextConfig = {
  async rewrites() {
    return [
      { source: "/ttph/:path*", destination: "https://tinhthanhpho.com/api/v1/:path*" },
    ];
  },
};
module.exports = nextConfig;
```

FE gọi nội bộ (cùng origin):

```ts
fetch(`/ttph/provinces?limit=1000`).then(r => r.json()).then(b => Array.isArray(b) ? b : b.data);
```

### 3.2 Next.js **Route Handler proxy** (linh hoạt hơn)

```ts
// app/api/ttph/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
const BASE = "https://tinhthanhpho.com/api/v1";
export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const upstream = new URL(`${BASE}/${params.path.join("/")}`);
  req.nextUrl.searchParams.forEach((v, k) => upstream.searchParams.set(k, v));
  const res = await fetch(upstream.toString(), { headers: { Accept: "application/json" } });
  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { "content-type": res.headers.get("content-type") ?? "application/json" } });
}
```

---

## 4) NestJS – Tích hợp chuẩn (không dùng Zod)

### 4.1 ENV

```
TINHTHANHPHO_BASE=https://tinhthanhpho.com/api/v1
TINHTHANHPHO_API_KEY=your_secret_key_here
```

### 4.2 HTTP client (Axios + retry + chỉ gắn Authorization khi có KEY)

```ts
// geo.http.ts
import { Injectable } from "@nestjs/common";
import axios from "axios"; import axiosRetry from "axios-retry";
@Injectable()
export class GeoHttp {
  private client = axios.create({ baseURL: process.env.TINHTHANHPHO_BASE, timeout: 8000, headers: { Accept: "application/json" } });
  constructor(){
    axiosRetry(this.client,{ retries:2, retryDelay:axiosRetry.exponentialDelay, retryCondition:(e)=>!e.response||e.response.status>=500 });
    this.client.interceptors.request.use((c)=>{ const key = process.env.TINHTHANHPHO_API_KEY; if(key && c.headers){ c.headers.Authorization = `Bearer ${key}`;} return c;});
  }
  get<T>(path: string, params?: Record<string, any>){ return this.client.get<T>(path,{ params }).then(r=>r.data); }
}
```

### 4.3 Service – unwrap `data`, map theo **code** (string), cache 24h

```ts
// geo.service.ts (trích)
function unwrapList(raw:any){ if(Array.isArray(raw)) return raw; if(raw && Array.isArray(raw.data)) return raw.data; throw new Error("Invalid payload shape"); }

async provinces(){ return this.getOrSet("geo:provinces", async ()=>{ const raw=await this.http.get<any>("/provinces",{limit:200}); const list=unwrapList(raw); return list.map((p:any)=>({ id:Number(p.code), code:String(p.code), name:p.name })); }); }
async districts(provinceCode:string){ const raw=await this.http.get<any>(`/provinces/${provinceCode}/districts`,{limit:500}); const list=unwrapList(raw); return list.map((d:any)=>({ id:Number(d.code), code:String(d.code), name:d.name })); }
async wards(districtCode:string){ const raw=await this.http.get<any>(`/districts/${districtCode}/wards`,{limit:500}); const list=unwrapList(raw); return list.map((w:any)=>({ id:Number(w.code), code:String(w.code), name:w.name })); }
```

### 4.4 Controller – nhận **code** (string), không dùng `ParseIntPipe`

```ts
@Get("districts")
getDistricts(@Query("province_code") provinceCode: string){ return this.geo.districts(provinceCode); }
@Get("wards")
getWards(@Query("district_code") districtCode: string){ return this.geo.wards(districtCode); }
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
