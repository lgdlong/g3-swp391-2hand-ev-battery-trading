'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, User, MessageSquare, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { getMyGivenRatings, getMyReceivedRatings, getSellerRatingStats } from '@/lib/api/ratingApi';
import type { RatingResponse } from '@/types/rating';
import Link from 'next/link';

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function RatingCard({ rating }: { rating: RatingResponse }) {
  const displayUser = rating.customer;
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('vi-VN').format(Number.parseFloat(price));
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={displayUser?.avatarUrl || ''} alt={displayUser?.fullName || 'User'} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-gray-900 truncate">
                {displayUser?.fullName || 'Người dùng'}
              </p>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatDate(rating.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <RatingStars rating={rating.rating} />
              <span className="text-sm text-gray-600">({rating.rating}/5)</span>
            </div>
            {rating.content && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{rating.content}</p>
            )}
            {/* Post info */}
            {rating.post && (
              <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                <p className="text-sm font-medium text-gray-800 truncate">{rating.post.title}</p>
                <p className="text-xs text-red-600 font-semibold">
                  {formatPrice(rating.post.priceVnd)} ₫
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RatingsList({
  ratings,
  isLoading,
  emptyMessage,
}: {
  ratings: RatingResponse[];
  isLoading: boolean;
  emptyMessage: string;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#048C73]" />
      </div>
    );
  }

  if (!ratings || ratings.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ratings.map((rating) => (
        <RatingCard key={rating.id} rating={rating} />
      ))}
    </div>
  );
}

export default function RatingPage() {
  const router = useRouter();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'given' | 'received'>('given');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [authLoading, isLoggedIn, router]);

  // Fetch my rating stats (as seller)
  const { data: myStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['myRatingStats', user?.id],
    queryFn: () => getSellerRatingStats(user!.id),
    enabled: !!user?.id && isLoggedIn,
  });

  // Fetch given ratings
  const { data: givenRatings, isLoading: isLoadingGiven } = useQuery({
    queryKey: ['myGivenRatings'],
    queryFn: () => getMyGivenRatings({ page: 1, limit: 50 }),
    enabled: !!user?.id && isLoggedIn,
  });

  // Fetch received ratings
  const { data: receivedRatings, isLoading: isLoadingReceived } = useQuery({
    queryKey: ['myReceivedRatings'],
    queryFn: () => getMyReceivedRatings({ page: 1, limit: 50 }),
    enabled: !!user?.id && isLoggedIn,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#048C73]" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/profile">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Link>
        </Button>

        {/* Rating Stats Header */}
        <Card className="mb-6 bg-gradient-to-r from-[#048C73] to-[#06B394]">
          <CardContent className="p-6">
            <div className="flex items-center gap-6 text-white">
              <div className="flex items-center justify-center w-20 h-20 bg-white/20 rounded-full">
                <Star className="h-10 w-10 fill-yellow-400 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Đánh giá của tôi</h1>
                {isLoadingStats ? (
                  <p className="text-white/80 mt-1">Đang tải...</p>
                ) : (
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-4xl font-bold">
                        {myStats?.averageRating?.toFixed(1) || '0.0'}
                      </span>
                      <div className="text-white/80">
                        <p className="text-sm">Điểm trung bình</p>
                        <p className="text-xs">(từ {myStats?.totalReviews || 0} đánh giá)</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'given' | 'received')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger
              value="given"
              className="font-semibold h-full data-[state=active]:bg-white gap-2"
            >
              Của tôi ({givenRatings?.total || 0})
            </TabsTrigger>
            <TabsTrigger
              value="received"
              className="font-semibold h-full data-[state=active]:bg-white gap-2"
            >
              Người mua ({receivedRatings?.total || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="given">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Đánh giá tôi đã gửi</CardTitle>
              </CardHeader>
              <CardContent>
                <RatingsList
                  ratings={givenRatings?.data || []}
                  isLoading={isLoadingGiven}
                  emptyMessage="Bạn chưa đánh giá sản phẩm nào"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="received">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Đánh giá từ người mua</CardTitle>
              </CardHeader>
              <CardContent>
                <RatingsList
                  ratings={receivedRatings?.data || []}
                  isLoading={isLoadingReceived}
                  emptyMessage="Bạn chưa nhận được đánh giá nào"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
