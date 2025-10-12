import { api } from '@/lib/axios';
import { Brand, Model } from '@/types/catalog';

const DEFAULT_BRAND_QUERY_LIMIT = 100;

export async function getCarBrands(): Promise<Brand[]> {
  const { data } = await api.get<Brand[]>('car-catalog/brands');
  return data;
}

export async function getBikeBrands(): Promise<Brand[]> {
  const { data } = await api.get<Brand[]>('bike-catalog/brands', {
    params: { limit: DEFAULT_BRAND_QUERY_LIMIT },
  });
  return data;
}

export async function getBatteryBrands(): Promise<Brand[]> {
  const { data } = await api.get<Brand[]>('battery-catalog/brands', {
    params: { limit: DEFAULT_BRAND_QUERY_LIMIT },
  });
  return data;
}

export async function getCarModels(brandId: number): Promise<Model[]> {
  const { data } = await api.get<Model[]>(`car-catalog/brands/${brandId}/models`);
  return data;
}

export async function getBikeModels(brandId: number): Promise<Model[]> {
  const { data } = await api.get<Model[]>(`bike-catalog/brands/${brandId}/models`);
  return data;
}
