export type Province = { code: string; name: string; type?: string };
export type District = { code: string; name: string; type?: string; province_code?: string };
export type Ward     = { code: string; name: string; type?: string; district_code?: string; province_code?: string };

const BASE = "https://tinhthanhpho.com/api/v1/";

async function apiGet<T>(path: string, params?: Record<string, any>): Promise<T> {
    const joined = `${BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
    const url = new URL(joined);
    Object.entries(params ?? {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });

  const r = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);

  const body = await r.json();
  // Docs: dữ liệu nằm trong body.data (wrapper). :contentReference[oaicite:1]{index=1}
  const data = Array.isArray(body) ? body : body?.data;
  if (!data) throw new Error("Invalid payload shape");
  return data as T;
}

export const getProvinces = (limit = 1000) =>
  apiGet<Province[]>("provinces", { limit }); // :contentReference[oaicite:2]{index=2}

export const getDistricts = (provinceCode: string, limit = 1000) =>
  apiGet<District[]>(`provinces/${provinceCode}/districts`, { limit }); // :contentReference[oaicite:3]{index=3}

export const getWards = (districtCode: string, limit = 1000) =>
  apiGet<Ward[]>(`districts/${districtCode}/wards`, { limit }); // :contentReference[oaicite:4]{index=4}
