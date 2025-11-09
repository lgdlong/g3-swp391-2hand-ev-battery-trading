import { api } from './instance';
import type {
  Purchase,
  RatingSubmitDto,
  RatingResponse,
  GetMyPurchasesResponse,
} from '@/types/rating.types';

/**
 * Rating API Client
 * APIs for rating/review system
 */

// ==================== API FUNCTIONS ====================

/**
 * Get list of user's purchases
 * Endpoint: GET /api/my-purchases hoặc /api/purchases/me
 */
export async function getMyPurchases(): Promise<Purchase[]> {
  try {
    // TODO: Thay endpoint đúng với BE của bạn
    const response = await api.get<GetMyPurchasesResponse>('/my-purchases');
    
    // Nếu BE trả về array trực tiếp:
    // const response = await api.get<Purchase[]>('/my-purchases');
    // return response.data;
    
    return response.data.purchases;
  } catch (error) {
    console.error('Error fetching purchases:', error);
    throw error;
  }
}

/**
 * Submit new rating for a purchase/post
 * Endpoint: POST /api/ratings hoặc /api/reviews
 */
export async function submitRating(data: RatingSubmitDto): Promise<RatingResponse> {
  try {
    // TODO: Thay endpoint đúng với BE của bạn
    const response = await api.post<RatingResponse>('/ratings', data);
    return response.data;
  } catch (error) {
    console.error('Error submitting rating:', error);
    throw error;
  }
}

/**
 * Update existing rating
 * Endpoint: PUT /api/ratings/:id hoặc PATCH /api/ratings/:id
 */
export async function updateRating(
  ratingId: string,
  data: { rating: number; comment: string }
): Promise<RatingResponse> {
  try {
    // TODO: Thay endpoint đúng với BE của bạn
    const response = await api.put<RatingResponse>(`/ratings/${ratingId}`, data);
    // Hoặc dùng PATCH:
    // const response = await api.patch<RatingResponse>(`/ratings/${ratingId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating rating:', error);
    throw error;
  }
}

/**
 * Get ratings for a specific post (optional - for post detail page)
 * Endpoint: GET /api/posts/:postId/ratings
 */
export async function getPostRatings(postId: string): Promise<RatingResponse[]> {
  try {
    const response = await api.get<{ ratings: RatingResponse[] }>(`/posts/${postId}/ratings`);
    return response.data.ratings;
  } catch (error) {
    console.error('Error fetching post ratings:', error);
    throw error;
  }
}

/**
 * Delete rating (optional)
 * Endpoint: DELETE /api/ratings/:id
 */
export async function deleteRating(ratingId: string): Promise<void> {
  try {
    await api.delete(`/ratings/${ratingId}`);
  } catch (error) {
    console.error('Error deleting rating:', error);
    throw error;
  }
}

// ==================== NOTES FOR BACKEND ====================
/*
Expected BE Endpoints:

1. GET /api/my-purchases
   Response: {
     purchases: Purchase[]
   }

2. POST /api/ratings
   Request: {
     postId: string,
     rating: number (1-5),
     comment: string
   }
   Response: RatingResponse

3. PUT /api/ratings/:id
   Request: {
     rating: number,
     comment: string
   }
   Response: RatingResponse

4. GET /api/posts/:postId/ratings (optional)
   Response: {
     ratings: RatingResponse[]
   }

5. DELETE /api/ratings/:id (optional)
   Response: 204 No Content
*/
