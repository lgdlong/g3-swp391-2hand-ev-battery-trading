'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/instance';
import { Star, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { RatingListResponse, RatingResponse } from '@/types/rating';

interface RatingsListProps {
  postId: string;
  limit?: number;
  page?: number;
}

/**
 * RatingsList - Hiển thị danh sách ratings của 1 post
 * - Fetch ratings từ API theo postId
 * - Hiển thị từng rating với avatar, name, rating, comment
 * - Pagination support
 * 
 * @example
 * ```tsx
 * <RatingsList postId="post-123" limit={10} page={1} />
 * ```
 */
export function RatingsList({ postId, limit = 10, page = 1 }: RatingsListProps) {
  const { data, isLoading, error } = useQuery<RatingListResponse>({
    queryKey: ['post-ratings', postId, page, limit],
    queryFn: async () => {
      const response = await api.get(`/ratings/post/${postId}`, {
        params: { page, limit, sort: 'newest' },
      });
      return response.data;
    },
    enabled: !!postId,
    staleTime: 2 * 60 * 1000, // Cache 2 phút
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse space-y-3 p-4 bg-gray-100 rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Có lỗi khi tải danh sách đánh giá</p>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Chưa có đánh giá nào cho bài đăng này</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">
          Đánh giá ({data.total})
        </h2>
      </div>

      {/* Ratings List */}
      <div className="space-y-4">
        {data.data.map((rating: RatingResponse) => (
          <RatingItem key={rating.id} rating={rating} />
        ))}
      </div>

      {/* Pagination Info */}
      {data.totalPages > 1 && (
        <div className="text-center text-sm text-gray-500 pt-4">
          Trang {data.page} / {data.totalPages}
        </div>
      )}
    </div>
  );
}

/**
 * RatingItem - Component hiển thị 1 rating
 */
function RatingItem({ rating }: { rating: RatingResponse }) {
  // Format stars
  const stars = Array.from({ length: 5 }, (_, i) => i < rating.rating);
  const displayName = rating.customer?.fullName || `Người dùng #${rating.userId}`;
  const [imageError, setImageError] = React.useState(false);

  // Get initials for fallback avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(displayName);
  const avatarUrl = rating.customer?.avatarUrl;

  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      {/* Header: Avatar + Name + Rating + Date */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-200">
          {avatarUrl && !imageError ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-xs font-semibold text-gray-600">{initials}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              {/* Name */}
              <p className="font-semibold text-gray-900">
                {displayName}
              </p>

              {/* Rating Stars */}
              <div className="flex items-center gap-1 mt-1">
                {stars.map((filled, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      filled
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm font-semibold text-gray-700">
                  {rating.rating}.0
                </span>
              </div>
            </div>

            {/* Date */}
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-500">
                {formatDate(new Date(rating.createdAt), 'dd/MM/yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comment */}
      {rating.content && (
        <div className="ml-13 text-gray-700 text-sm leading-relaxed">
          <p>{rating.content}</p>
        </div>
      )}
    </div>
  );
}
