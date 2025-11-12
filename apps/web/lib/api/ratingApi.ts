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
export async function submitRating(
  postId: string,
  data: CreateRatingDto
): Promise<RatingResponse> {
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
  params?: GetRatingsParams
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

