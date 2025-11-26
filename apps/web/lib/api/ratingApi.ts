import { api } from '../axios';
import type {
  CreateRatingDto,
  RatingResponse,
  RatingListResponse,
  GetRatingsParams,
} from '@/types/rating';

/**
 * Rating API Client - Aligned with Backend
 * Backend path: apps/api/src/modules/post-ratings/
 */

// ==================== API FUNCTIONS ====================

/**
 * Create a rating for a post
 * Endpoint: POST /ratings/post/:id
 * Auth: Required (JWT)
 */
export async function submitRating(postId: string, data: CreateRatingDto): Promise<RatingResponse> {
  try {
    const response = await api.post<RatingResponse>(`/ratings/post/${postId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error submitting rating:', error);
    throw error;
  }
}

/**
 * Get all ratings for a specific post with pagination
 * Endpoint: GET /ratings/post/:id
 * Auth: Not required (Public)
 */
export async function getPostRatings(
  postId: string,
  params?: GetRatingsParams,
): Promise<RatingListResponse> {
  try {
    const response = await api.get<RatingListResponse>(`/ratings/post/${postId}`, {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        rating: params?.rating,
        sort: params?.sort || 'newest',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching post ratings:', error);
    throw error;
  }
}

/**
 * Get a specific rating by ID
 * Endpoint: GET /ratings/:id
 * Auth: Required (JWT)
 */
export async function getRatingById(ratingId: string): Promise<RatingResponse> {
  try {
    const response = await api.get<RatingResponse>(`/ratings/${ratingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rating:', error);
    throw error;
  }
}

/**
 * Check if current user has rated a post
 * Endpoint: GET /ratings/check/:postId
 * Auth: Required (JWT)
 */
export async function checkUserRatedPost(postId: string): Promise<{ hasRated: boolean }> {
  try {
    const response = await api.get<{ hasRated: boolean }>(`/ratings/check/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking rating status:', error);
    throw error;
  }
}

/**
 * Get ratings given by the current user
 * Endpoint: GET /ratings/my/given
 * Auth: Required (JWT)
 */
export async function getMyGivenRatings(params?: {
  page?: number;
  limit?: number;
}): Promise<RatingListResponse> {
  try {
    const response = await api.get<RatingListResponse>('/ratings/my/given', {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 20,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching my given ratings:', error);
    throw error;
  }
}

/**
 * Get ratings received by the current user (as seller)
 * Endpoint: GET /ratings/my/received
 * Auth: Required (JWT)
 */
export async function getMyReceivedRatings(params?: {
  page?: number;
  limit?: number;
}): Promise<RatingListResponse> {
  try {
    const response = await api.get<RatingListResponse>('/ratings/my/received', {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 20,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching my received ratings:', error);
    throw error;
  }
}

/**
 * Get seller rating statistics
 * Endpoint: GET /ratings/seller/:sellerId/stats
 * Auth: Not required (Public)
 */
export async function getSellerRatingStats(
  sellerId: number,
): Promise<{ averageRating: number; totalReviews: number }> {
  try {
    const response = await api.get<{ averageRating: number; totalReviews: number }>(
      `/ratings/seller/${sellerId}/stats`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching seller rating stats:', error);
    throw error;
  }
}
