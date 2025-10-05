'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Check, 
  X,
  Calendar,
  MapPin,
  User
} from 'lucide-react';
import { getAdminPosts, approvePost, rejectPost, type PostsResponse } from '@/lib/api/postApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type FilterStatus = 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'DRAFT' | 'ALL';

export default function AdminPostsPage() {
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('PENDING_REVIEW');
  const queryClient = useQueryClient();

  // Fetch posts based on current filter
  const { data: postsData, isLoading, error } = useQuery<PostsResponse>({
    queryKey: ['admin-posts', currentFilter],
    queryFn: () => getAdminPosts({
      status: currentFilter === 'ALL' ? undefined : currentFilter,
      limit: 50,
      order: 'DESC',
      sort: 'createdAt'
    }),
  });

  // Approve post mutation
  const approveMutation = useMutation({
    mutationFn: (postId: string) => approvePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
  });

  // Reject post mutation
  const rejectMutation = useMutation({
    mutationFn: (postId: string) => rejectPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
  });

  // Get status counts
  const { data: pendingData } = useQuery({
    queryKey: ['admin-posts-count', 'PENDING_REVIEW'],
    queryFn: () => getAdminPosts({ status: 'PENDING_REVIEW', limit: 1 }),
  });

  const { data: approvedData } = useQuery({
    queryKey: ['admin-posts-count', 'PUBLISHED'],
    queryFn: () => getAdminPosts({ status: 'PUBLISHED', limit: 1 }),
  });

  const { data: rejectedData } = useQuery({
    queryKey: ['admin-posts-count', 'REJECTED'],
    queryFn: () => getAdminPosts({ status: 'REJECTED', limit: 1 }),
  });

  const { data: allData } = useQuery({
    queryKey: ['admin-posts-count', 'ALL'],
    queryFn: () => getAdminPosts({ limit: 1 }),
  });

  const pendingCount = pendingData?.total || 0;
  const approvedCount = approvedData?.total || 0;
  const rejectedCount = rejectedData?.total || 0;
  const allCount = allData?.total || 0;

  const handleApprove = (postId: string) => {
    if (confirm('Bạn có chắc chắn muốn duyệt bài viết này?')) {
      approveMutation.mutate(postId);
    }
  };

  const handleReject = (postId: string) => {
    if (confirm('Bạn có chắc chắn muốn từ chối bài viết này?')) {
      rejectMutation.mutate(postId);
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(numPrice);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const META = {
    DRAFT:          { label: 'Bản nháp',     cls: 'bg-gray-50 text-gray-700 border-gray-200' },
    PENDING_REVIEW: { label: 'Chờ duyệt',    cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    PUBLISHED:      { label: 'Đã đăng',      cls: 'bg-green-50 text-green-700 border-green-200' },
    REJECTED:       { label: 'Từ chối',      cls: 'bg-red-50 text-red-700 border-red-200' },
    PAUSED:         { label: 'Tạm dừng',     cls: 'bg-orange-50 text-orange-700 border-orange-200' },
    SOLD:           { label: 'Đã bán',       cls: 'bg-purple-50 text-purple-700 border-purple-200' },
    ARCHIVED:       { label: 'Lưu trữ',      cls: 'bg-gray-50 text-gray-700 border-gray-200' },
  } as const;

  const getStatusBadge = (status: string) => {
    const meta = META[status as keyof typeof META] || { label: status, cls: '' };
    return <Badge variant="outline" className={meta.cls}>{meta.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Car className="w-8 h-8 text-black" />
          <div>
              <h1 className="text-3xl font-bold text-black">2Hand</h1>
              <p className="text-gray-600">EV Battery</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-black">Admin</div>
            <div className="text-sm text-gray-600">Quản trị viên</div>
          </div>
        </div>

        {/* Status Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-black mb-2">Chờ duyệt</h3>
                  <div className="text-3xl font-bold text-black">{pendingCount}</div>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-black mb-2">Đã duyệt</h3>
                  <div className="text-3xl font-bold text-black">{approvedCount}</div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-black mb-2">Từ chối</h3>
                  <div className="text-3xl font-bold text-black">{rejectedCount}</div>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Post Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-black">Quản lý tin đăng</CardTitle>
            <p className="text-gray-600">Phê duyệt hoặc từ chối tin đăng từ thành viên</p>
          </CardHeader>
          <CardContent>
            {/* Filter Buttons */}
            <div className="flex gap-3 mb-6 flex-wrap justify-start">
              <Button
                variant={currentFilter === 'PENDING_REVIEW' ? 'default' : 'outline'}
                onClick={() => setCurrentFilter('PENDING_REVIEW')}
                className={currentFilter === 'PENDING_REVIEW' ? 'bg-black text-white' : ''}
              >
                Chờ duyệt ({pendingCount})
              </Button>
              <Button
                variant={currentFilter === 'PUBLISHED' ? 'default' : 'outline'}
                onClick={() => setCurrentFilter('PUBLISHED')}
                className={currentFilter === 'PUBLISHED' ? 'bg-black text-white' : ''}
              >
                Đã duyệt ({approvedCount})
              </Button>
              <Button
                variant={currentFilter === 'REJECTED' ? 'default' : 'outline'}
                onClick={() => setCurrentFilter('REJECTED')}
                className={currentFilter === 'REJECTED' ? 'bg-black text-white' : ''}
              >
                Từ chối ({rejectedCount})
              </Button>
              <Button
                variant={currentFilter === 'DRAFT' ? 'default' : 'outline'}
                onClick={() => setCurrentFilter('DRAFT')}
                className={currentFilter === 'DRAFT' ? 'bg-black text-white' : ''}
              >
                Bản nháp (0)
              </Button>
              <Button
                variant={currentFilter === 'ALL' ? 'default' : 'outline'}
                onClick={() => setCurrentFilter('ALL')}
                className={currentFilter === 'ALL' ? 'bg-black text-white' : ''}
              >
                Tất cả ({allCount})
              </Button>
            </div>

            {/* Posts List */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-gray-600 mt-2">Đang tải...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-600">Có lỗi xảy ra khi tải dữ liệu</p>
              </div>
            )}

            {!isLoading && !error && postsData?.data && postsData.data.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Không có tin đăng nào trong danh mục này.</p>
              </div>
            )}

            {!isLoading && !error && postsData?.data && postsData.data.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {postsData.data.map((post) => (
                  <Card key={post.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Post Image */}
                        <div>
                          {post.images && Array.isArray(post.images) && post.images.length > 0 ? (
                            <Image
                              src={typeof post.images[0] === 'string' ? post.images[0] : (post.images[0] as { url: string })?.url}
                              alt={post.title}
                              width={400}
                              height={192}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Car className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Post Details */}
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base font-semibold text-black line-clamp-2 flex-1">{post.title}</h3>
                            {getStatusBadge(post.status)}
                          </div>
                          
                          <p className="text-gray-600 text-sm line-clamp-2">{post.description}</p>
                          
                          <div className="text-xl font-bold text-green-600">
                            {formatPrice(post.priceVnd)}
                            {post.isNegotiable && <span className="text-sm text-gray-500 ml-2">(Có thể thương lượng)</span>}
                          </div>

                          <div className="flex flex-col gap-1 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {typeof post.provinceNameCached === 'string' ? post.provinceNameCached : ''}
                                {typeof post.districtNameCached === 'string' ? `, ${post.districtNameCached}` : ''}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{post.seller.fullName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                          </div>

                          {/* Vehicle Details */}
                          {post.carDetails && (
                            <div className="text-sm text-gray-600">
                              <span>Xe ô tô • {String(post.carDetails.manufacture_year || 'N/A')} • {String(post.carDetails.odo_km || 'N/A')} km</span>
                            </div>
                          )}
                          {post.bikeDetails && (
                            <div className="text-sm text-gray-600">
                              <span>Xe máy • {String(post.bikeDetails.manufacture_year || 'N/A')} • {String(post.bikeDetails.odo_km || 'N/A')} km</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            Xem chi tiết
                          </Button>
                          
                          {post.status === 'PENDING_REVIEW' && (
                            <>
                              <Button
                                onClick={() => handleApprove(post.id)}
                                disabled={approveMutation.isPending}
                                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 text-sm"
                              >
                                <Check className="w-4 h-4" />
                                {approveMutation.isPending ? 'Đang duyệt...' : 'Duyệt'}
                              </Button>
                              <Button
                                onClick={() => handleReject(post.id)}
                                disabled={rejectMutation.isPending}
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-2 text-sm"
                              >
                                <X className="w-4 h-4" />
                                {rejectMutation.isPending ? 'Đang từ chối...' : 'Từ chối'}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
