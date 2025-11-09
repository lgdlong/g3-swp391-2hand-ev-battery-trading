/**
 * Types for Rating System
 * These types define the data structure for rating/review features
 */

/**
 * Purchase represents a completed transaction
 */
export interface Purchase {
  id: string;
  postId: string;
  postTitle: string;
  postPrice: string;
  postImages?: Array<{
    url: string;
    public_id: string;
  }>;
  sellerId: number;
  sellerName: string;
  purchasedAt: string;
  hasRated?: boolean;
  userRating?: number;
  userComment?: string;
}

/**
 * Rating submission data
 */
export interface RatingSubmitDto {
  purchaseId?: string;
  postId?: string;
  rating: number; // 1-5 stars
  comment: string; // Max 1000 chars
}

/**
 * Rating response from API
 */
export interface RatingResponse {
  id: string;
  purchaseId?: string;
  postId: string;
  buyerId: number;
  sellerId: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Get my purchases response
 */
export interface GetMyPurchasesResponse {
  purchases: Purchase[];
  total?: number;
}

/**
 * Rating statistics for a post or seller
 */
export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
