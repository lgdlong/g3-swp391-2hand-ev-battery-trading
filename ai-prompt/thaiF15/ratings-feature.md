# Post Ratings Feature - Implementation Documentation

## Overview
Comprehensive rating system allowing users to rate posts (EV cars, bikes, batteries) with star ratings and comments. Displays all ratings in a paginated list with user avatars, names, and timestamps.

## Architecture

### Frontend Components

#### 1. **RatingModal** (`apps/web/components/RatingModal.tsx`)
- Uncontrolled modal component for submitting ratings
- Features:
  - 5-star rating selector with hover effects
  - Textarea for comments (max 1000 chars)
  - Auto-submit on successful rating
  - Shows success toast notification
  - Props: `postId`, `postTitle?`, `buttonText?`, `onSuccess?`

#### 2. **RatingsList** (`apps/web/components/RatingsList.tsx`)
- Displays paginated list of all ratings for a post
- Features:
  - React Query integration for data fetching with caching (2 min)
  - Displays rating stars, comment, user name, and date
  - User avatar with fallback initials (e.g., "PL" for "Phùng Lưu")
  - Loading skeleton UI (3 placeholder cards)
  - Empty state message when no ratings exist
  - Error handling with fallback message
  - Pagination info display
- Props: `postId`, `limit?: 10`, `page?: 1`

#### 3. **SellerRatingDisplay** (`apps/web/components/SellerRatingDisplay.tsx`)
- Compact display of seller's average rating
- Format: "⭐ 4.4 (8 Đánh giá)"
- Props: `averageRating`, `totalReviews`, `className?`

### Backend Endpoints

#### Create Rating
```
POST /ratings/post/:id
Authorization: Bearer <token>
Body: {
  rating: number (0-5),
  content?: string (max 1000 chars)
}
Response: PostRatingResponseDto
```

#### Get Post Ratings
```
GET /ratings/post/:id?page=1&limit=10&sort=newest&rating=5
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - rating: number (0-5, optional - filter by rating)
  - sort: 'newest' | 'rating_desc' | 'rating_asc' (default: 'newest')

Response: {
  data: RatingResponse[],
  total: number,
  page: number,
  limit: number,
  totalPages: number
}
```

#### Get Seller Rating Stats
```
GET /ratings/seller/:sellerId/stats
Response: {
  averageRating: number,
  totalReviews: number
}
```

#### Get Single Rating
```
GET /ratings/:id
Authorization: Bearer <token>
Response: PostRatingResponseDto
```

## Data Models

### Frontend Types (`apps/web/types/rating.ts`)

```typescript
interface SafeAccountDto {
  id: number;
  email?: string | null;
  phone?: string | null;
  fullName: string;
  avatarUrl?: string | null;
  status: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RatingResponse {
  id: string;
  rating: number;
  content?: string | null;
  postId: string | number;
  userId: number;
  customer?: SafeAccountDto | null;
  seller?: SafeAccountDto | null;
  createdAt: Date;
  updatedAt?: Date;
}

interface RatingListResponse {
  data: RatingResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface GetRatingsParams {
  page?: number;
  limit?: number;
  rating?: number;
  sort?: 'newest' | 'rating_desc' | 'rating_asc';
}
```

### Backend Entity (`apps/api/src/modules/post-ratings/entities/post-ratings.entity.ts`)

```typescript
@Entity('post_ratings')
export class PostRatings {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ManyToOne(() => Post, (post) => post.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @ManyToOne(() => Account, (account) => account.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'customer_id' })
  customer!: Account | null;

  @Min(0)
  @Max(5)
  @Column({ name: 'rating', type: 'int' })
  rating!: number;

  @Column({ name: 'content', type: 'text', nullable: true })
  content!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
```

## API Client (`apps/web/lib/api/ratingApi.ts`)

```typescript
// Submit new rating
export const submitRating = (postId: string, data: CreateRatingDto) =>
  api.post(`/ratings/post/${postId}`, data);

// Get ratings for a post
export const getPostRatings = (postId: string, params?: GetRatingsParams) =>
  api.get(`/ratings/post/${postId}`, { params });

// Get single rating by ID
export const getRatingById = (ratingId: string) =>
  api.get(`/ratings/${ratingId}`);
```

## Hooks

### useSellerRating (`apps/web/hooks/useSellerRating.ts`)
```typescript
export function useSellerRating(sellerId?: string | number) {
  // Fetches: GET /ratings/seller/:sellerId/stats
  // Cache: 5 minutes
  // Returns: { averageRating, totalReviews, isLoading, error }
}
```

## Integration Points

### Post Detail Pages
- **EV Posts**: `apps/web/app/(public)/posts/ev/[id]/page.tsx`
- **Battery Posts**: `apps/web/app/(public)/posts/batteries/[id]/page.tsx`

Both pages include:
1. **SellerInfo Component** - Shows seller avatar, name, and rating stats
2. **RatingsList Component** - Displays all ratings below specifications

### Usage Example
```tsx
<div className="space-y-6">
  <PostHeader post={post} />
  <Specifications post={post} />
  <RatingsList postId={post.id} limit={10} />
</div>
```

## Features Implemented

✅ Submit ratings with 5-star selector and comments
✅ Display paginated rating list with sorting
✅ Show seller rating statistics
✅ User avatar display with fallback initials
✅ Loading states with skeleton UI
✅ Error handling and empty states
✅ Soft delete support (deletedAt)
✅ Duplicate rating prevention
✅ Role-based access control

## Database Schema

```sql
CREATE TABLE post_ratings (
  id BIGSERIAL PRIMARY KEY,
  post_id VARCHAR NOT NULL,
  customer_id INT,
  rating INT NOT NULL CHECK (rating >= 0 AND rating <= 5),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES accounts(id) ON DELETE SET NULL
);
```

## Key Implementation Details

### Avatar Handling
- First attempts to load `customer.avatarUrl`
- If URL fails or is null, displays initials from name
- Example: "Phùng Lưu Hoàng Long" → "PL"

### Response Structure Fix
Backend `findAll()` method returns:
```json
{
  "data": [...ratings],
  "total": 0,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### Query Optimization
Using `leftJoinAndSelect` for:
- `r.customer` - Rating creator info
- `r.post` - Post details
- `post.seller` - Seller info for rating stats

## Testing Checklist

- [ ] Submit rating from post detail page
- [ ] Verify rating appears in list immediately
- [ ] Check avatar displays correctly
- [ ] Test pagination (if >10 ratings)
- [ ] Verify seller stats update after new rating
- [ ] Test with missing avatarUrl (should show initials)
- [ ] Test error handling (network failure)
- [ ] Verify soft delete works (rating not displayed)
- [ ] Check duplicate rating prevention

## Future Enhancements

- [ ] Edit/delete own ratings
- [ ] Filter ratings by star rating
- [ ] Sort by rating (highest/lowest first)
- [ ] Add rating response from sellers
- [ ] Display rating distribution histogram
- [ ] Email notifications for new ratings
- [ ] Verified purchase badge on ratings
