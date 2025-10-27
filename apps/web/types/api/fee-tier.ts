/**
 * Fee Tier type definitions
 */

export interface FeeTier {
  id: number;
  minPrice: string;
  maxPrice: string | null;
  depositRate: string;
  active: boolean;
  updatedAt: string;
}

export interface CreateFeeTierDto {
  minPrice: number;
  maxPrice: number;
  depositRate: number;
  active: boolean;
}

export interface UpdateFeeTierDto {
  minPrice?: number;
  maxPrice?: number;
  depositRate?: number;
  active?: boolean;
}

export interface DeleteFeeTierResponse {
  message: string;
}

