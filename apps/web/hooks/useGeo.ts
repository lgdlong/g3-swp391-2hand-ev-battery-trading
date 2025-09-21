// apps/web/src/hooks/useGeo.ts
'use client';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getProvinces, getDistricts, getWards } from '@/lib/tinhthanhpho';
import type { Province, District, Ward } from '@/lib/tinhthanhpho';

// 1) Provinces
export const useProvinces: () => UseQueryResult<Province[], Error> = () => {
  return useQuery<Province[], Error>({
    queryKey: ['geo', 'provinces'] as const,
    queryFn: () => getProvinces(),
    staleTime: 24 * 60 * 60 * 1000,
  });
};

// 2) Districts
export const useDistricts: (provinceCode?: string) => UseQueryResult<District[], Error> = (
  provinceCode,
) => {
  return useQuery<District[], Error>({
    queryKey: ['geo', 'districts', provinceCode] as const,
    queryFn: () => getDistricts(provinceCode!),
    enabled: !!provinceCode,
    staleTime: 24 * 60 * 60 * 1000,
  });
};

// 3) Wards
export const useWards: (districtCode?: string) => UseQueryResult<Ward[], Error> = (
  districtCode,
) => {
  return useQuery<Ward[], Error>({
    queryKey: ['geo', 'wards', districtCode] as const,
    queryFn: () => getWards(districtCode!),
    enabled: !!districtCode,
    staleTime: 24 * 60 * 60 * 1000,
  });
};
