import { api } from '@/lib/axios';

export interface Brand {
  id: number;
  name: string;
}

export interface Model {
  id: number;
  name: string;
}

export async function getCarBrands(): Promise<Brand[]> {
  const { data } = await api.get<Brand[]>('car-catalog/brands');
  return data;
}

export async function getBikeBrands(): Promise<Brand[]> {
  const { data } = await api.get<Brand[]>('bike-catalog/brands');
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
