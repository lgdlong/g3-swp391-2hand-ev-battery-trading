/**
 * Fee Tier type definitions
 */

export interface FeeTier {
  id: number;
  minPrice: string;
  maxPrice: string | null;
  postingFee: string;
  active: boolean;
  updatedAt: string;
}

export interface CreateFeeTierDto {
  minPrice: number;
  maxPrice: number;
  postingFee: number;
  active: boolean;
}

export interface UpdateFeeTierDto {
  minPrice?: number;
  maxPrice?: number;
  postingFee?: number;
  active?: boolean;
}

export interface DeleteFeeTierResponse {
  message: string;
}
