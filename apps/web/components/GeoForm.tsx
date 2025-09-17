"use client";
import { useState } from "react";
import { useProvinces, useDistricts, useWards } from "@/hooks/useGeo";

export default function GeoForm() {
  const [provinceCode, setProvinceCode] = useState<string>("");
  const [districtCode, setDistrictCode] = useState<string>("");
  const [wardCode, setWardCode] = useState<string>("");

  const provincesQ = useProvinces();
  const districtsQ = useDistricts(provinceCode || undefined);
  const wardsQ = useWards(districtCode || undefined);

  const provinces = provincesQ.data ?? [];
  const districts = districtsQ.data ?? [];
  const wards = wardsQ.data ?? [];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm opacity-80">Tỉnh/Thành</label>
        <select
          className="rounded-xl border bg-black/20 p-2"
          value={provinceCode}
          onChange={(e) => {
            setProvinceCode(e.target.value);
            setDistrictCode("");
            setWardCode("");
          }}
        >
          <option value="">-- Chọn tỉnh --</option>
          {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm opacity-80">Quận/Huyện</label>
        <select
          className="rounded-xl border bg-black/20 p-2"
          value={districtCode}
          disabled={!provinceCode || districtsQ.isLoading}
          onChange={(e) => {
            setDistrictCode(e.target.value);
            setWardCode("");
          }}
        >
          <option value="">-- Chọn quận/huyện --</option>
          {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm opacity-80">Phường/Xã</label>
        <select
          className="rounded-xl border bg-black/20 p-2"
          value={wardCode}
          disabled={!districtCode || wardsQ.isLoading}
          onChange={(e) => setWardCode(e.target.value)}
        >
          <option value="">-- Chọn phường/xã --</option>
          {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
        </select>
      </div>
    </div>
  );
}
