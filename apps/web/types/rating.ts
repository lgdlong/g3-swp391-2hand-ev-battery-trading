/**
 * Types for Rating System
 * Aligned with Backend API: apps/api/src/modules/post-ratings/
 */

// ==================== MAIN TYPES ====================

/**
 * DTO for creating a new rating
 * Backend: CreatePostRatingDto
 */
export interface CreateRatingDto {
  rating: number; // 0-5
  content?: string; // Optional review content (max 1000 chars)
}

/**
 * Rating response from API
 * Backend: PostRatingResponseDto
 */
export interface RatingResponse {
  id: string;
  rating: number;
  content?: string;
  postId: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Paginated list of ratings
 * Backend: PostRatingListResponseDto
 */
export interface RatingListResponse {
  data: RatingResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Query parameters for fetching ratings
 */
export interface GetRatingsParams {
  page?: number;
  limit?: number;
  rating?: number; // Filter by rating (0-5)
  sort?: 'newest' | 'rating_desc' | 'rating_asc';
}

// ==================== LEGACY TYPES (for future features) ====================

/**
 * Purchase represents a completed transaction
 * TODO: Align with actual Purchase/Order API when available
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

