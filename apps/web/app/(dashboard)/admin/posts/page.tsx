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
  User,
  RefreshCw
} from 'lucide-react';
import { getAdminPosts, approvePost, rejectPost, type PostsResponse } from '@/lib/api/postApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type FilterStatus = 'DRAFT' | 'PUBLISHED' | 'REJECTED';

export default function AdminPostsPage() {
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('DRAFT');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const queryClient = useQueryClient();

  // Fetch posts based on current filter
  const { data: postsData, isLoading, error, refetch } = useQuery<PostsResponse>({
    queryKey: ['admin-posts', currentFilter, currentPage],
    queryFn: () => getAdminPosts({
      status: currentFilter,
      page: currentPage,
      limit: pageSize,
      order: 'DESC',
      sort: 'createdAt'
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  console.log(postsData)
  // Approve post mutation
  const approveMutation = useMutation({
    mutationFn: (postId: string) => approvePost(postId),
    onSuccess: () => {
      // Refresh all queries to update counts and lists
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-posts-count'] });
      alert('Duyệt bài viết thành công!');
    },
    onError: (error) => {
      console.error('Error approving post:', error);
      alert('Có lỗi xảy ra khi duyệt bài viết!');
    },
  });

  // Reject post mutation
  const rejectMutation = useMutation({
    mutationFn: (postId: string) => rejectPost(postId),
    onSuccess: () => {
      // Refresh all queries to update counts and lists
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-posts-count'] });
      alert('Từ chối bài viết thành công!');
    },
    onError: (error) => {
      console.error('Error rejecting post:', error);
      alert('Có lỗi xảy ra khi từ chối bài viết!');
    },
  });


  // Get status counts with caching - lấy tất cả để đếm đúng số lượng
  const { data: draftData } = useQuery<PostsResponse>({
    queryKey: ['admin-posts-count', 'DRAFT'],
    queryFn: () => getAdminPosts({ status: 'DRAFT', limit: 1000 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: approvedData } = useQuery<PostsResponse>({
    queryKey: ['admin-posts-count', 'PUBLISHED'],
    queryFn: () => getAdminPosts({ status: 'PUBLISHED', limit: 1000 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: rejectedData } = useQuery<PostsResponse>({
    queryKey: ['admin-posts-count', 'REJECTED'],
    queryFn: () => getAdminPosts({ status: 'REJECTED', limit: 1000 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const draftCount = draftData?.total || 0;
  const approvedCount = approvedData?.total || 0;
  const rejectedCount = rejectedData?.total || 0;

  // Debug log để kiểm tra số lượng
  console.log('Counts:', { draftCount, approvedCount, rejectedCount });
  console.log('Data:', { draftData, approvedData, rejectedData });

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


  const handleViewDetails = (post: any) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPost(null);
  };

  // Pagination functions
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    if (postsData) {
      const totalPages = Math.ceil(postsData.total / pageSize);
      setCurrentPage(totalPages);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (postsData) {
      const totalPages = Math.ceil(postsData.total / pageSize);
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      
      // Reset to first page when refreshing
      setCurrentPage(1);
      
      // Invalidate và refetch tất cả queries để cập nhật dữ liệu mới
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-posts'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-posts-count'] }),
        refetch()
      ]);
      
      // Hiển thị thông báo
      alert('Đã làm mới dữ liệu thành công!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('Có lỗi xảy ra khi làm mới dữ liệu!');
    } finally {
      setIsRefreshing(false);
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
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-black">Thống kê bài đăng</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-black mb-2">Bản nháp</h3>
                  <div className="text-3xl font-bold text-black">{draftCount}</div>
                </div>
                <Clock className="w-8 h-8 text-gray-600" />
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-black">Quản lý tin đăng</CardTitle>
                <p className="text-gray-600">Phê duyệt hoặc từ chối tin đăng từ thành viên</p>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Đang làm mới...' : 'Làm mới'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filter Buttons */}
            <div className="flex gap-3 mb-6 flex-wrap justify-start">
              <Button
                variant={currentFilter === 'DRAFT' ? 'default' : 'outline'}
                onClick={() => {
                  setCurrentFilter('DRAFT');
                  setCurrentPage(1);
                }}
                className={currentFilter === 'DRAFT' ? 'bg-black text-white' : ''}
              >
                Bản nháp ({draftCount})
              </Button>
              <Button
                variant={currentFilter === 'PUBLISHED' ? 'default' : 'outline'}
                onClick={() => {
                  setCurrentFilter('PUBLISHED');
                  setCurrentPage(1);
                }}
                className={currentFilter === 'PUBLISHED' ? 'bg-black text-white' : ''}
              >
                Đã duyệt ({approvedCount})
              </Button>
              <Button
                variant={currentFilter === 'REJECTED' ? 'default' : 'outline'}
                onClick={() => {
                  setCurrentFilter('REJECTED');
                  setCurrentPage(1);
                }}
                className={currentFilter === 'REJECTED' ? 'bg-black text-white' : ''}
              >
                Từ chối ({rejectedCount})
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
              <div className="space-y-4">
                {postsData.data.map((post) => (
                  <Card key={post.id} className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {/* Post Image */}
                        <div className="flex-shrink-0">
                          {post.images && Array.isArray(post.images) && post.images.length > 0 ? (
                            <Image
                              src={typeof post.images[0] === 'string' ? post.images[0] : (post.images[0] as { url: string })?.url}
                              alt={post.title}
                              width={200}
                              height={150}
                              className="w-48 h-36 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-48 h-36 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Car className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Post Details */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-black mb-2">{post.title}</h3>
                              <div className="text-sm text-gray-600 mb-3">
                                <p className="line-clamp-3">{post.description}</p>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {getStatusBadge(post.status)}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-600">
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
                          {(post.carDetails || post.bikeDetails) && (
                            <div className="text-sm text-gray-600">
                              {post.carDetails && (
                                <span>Xe ô tô • {String(post.carDetails.manufacture_year || 'N/A')} • {String(post.carDetails.odo_km || 'N/A')} km</span>
                              )}
                              {post.bikeDetails && (
                                <span>Xe máy • {String(post.bikeDetails.manufacture_year || 'N/A')} • {String(post.bikeDetails.odo_km || 'N/A')} km</span>
                              )}
                            </div>
                          )}

                          <div className="text-xl font-bold text-green-600">
                            {formatPrice(post.priceVnd)}
                            {post.isNegotiable && <span className="text-sm text-gray-500 ml-2">(Có thể thương lượng)</span>}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 flex flex-col gap-3 min-w-[200px]">
                          <Button
                            onClick={() => handleViewDetails(post)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            Xem chi tiết
                          </Button>
                          
                          {post.status === 'DRAFT' && (
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
                          {post.status === 'PUBLISHED' && (
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

        {/* Modal chi tiết bài đăng */}
        {showModal && selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-black">Chi tiết bài đăng</h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hình ảnh */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Hình ảnh</h3>
                    {selectedPost.images && Array.isArray(selectedPost.images) && selectedPost.images.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedPost.images.map((image: any, index: number) => (
                          <Image
                            key={index}
                            src={typeof image === 'string' ? image : image?.url}
                            alt={`${selectedPost.title} ${index + 1}`}
                            width={200}
                            height={150}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Car className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Thông tin cơ bản */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Thông tin cơ bản</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">Tiêu đề:</span>
                        <p className="text-gray-700">{selectedPost.title}</p>
                      </div>
                      <div>
                        <span className="font-medium">Mô tả:</span>
                        <p className="text-gray-700">{selectedPost.description}</p>
                      </div>
                      <div>
                        <span className="font-medium">Giá:</span>
                        <p className="text-green-600 font-bold">{formatPrice(selectedPost.priceVnd)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Trạng thái:</span>
                        <div className="mt-1">{getStatusBadge(selectedPost.status)}</div>
                      </div>
                      <div>
                        <span className="font-medium">Địa chỉ:</span>
                        <p className="text-gray-700">
                          {typeof selectedPost.provinceNameCached === 'string' ? selectedPost.provinceNameCached : ''}
                          {typeof selectedPost.districtNameCached === 'string' ? `, ${selectedPost.districtNameCached}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông tin người bán */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Thông tin người bán</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="font-medium">Tên:</span>
                      <p className="text-gray-700">{selectedPost.seller.fullName}</p>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="text-gray-700">{selectedPost.seller.email}</p>
                    </div>
                    <div>
                      <span className="font-medium">Số điện thoại:</span>
                      <p className="text-gray-700">{selectedPost.seller.phone || 'Chưa cung cấp'}</p>
                    </div>
                  </div>
                </div>

                {/* Chi tiết xe (nếu có) */}
                {(selectedPost.carDetails || selectedPost.bikeDetails) && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Chi tiết xe</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedPost.carDetails && (
                        <>
                          <div>
                            <span className="font-medium">Loại xe:</span>
                            <p className="text-gray-700">Ô tô điện</p>
                          </div>
                          <div>
                            <span className="font-medium">Năm sản xuất:</span>
                            <p className="text-gray-700">{selectedPost.carDetails.manufacture_year || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Số km đã chạy:</span>
                            <p className="text-gray-700">{selectedPost.carDetails.odo_km || 'N/A'} km</p>
                          </div>
                          <div>
                            <span className="font-medium">Dung lượng pin:</span>
                            <p className="text-gray-700">{selectedPost.carDetails.battery_capacity_kwh || 'N/A'} kWh</p>
                          </div>
                        </>
                      )}
                      {selectedPost.bikeDetails && (
                        <>
                          <div>
                            <span className="font-medium">Loại xe:</span>
                            <p className="text-gray-700">Xe máy điện</p>
                          </div>
                          <div>
                            <span className="font-medium">Năm sản xuất:</span>
                            <p className="text-gray-700">{selectedPost.bikeDetails.manufacture_year || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Số km đã chạy:</span>
                            <p className="text-gray-700">{selectedPost.bikeDetails.odo_km || 'N/A'} km</p>
                          </div>
                          <div>
                            <span className="font-medium">Dung lượng pin:</span>
                            <p className="text-gray-700">{selectedPost.bikeDetails.battery_capacity_kwh || 'N/A'} kWh</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Nút hành động */}
                <div className="mt-6 flex justify-between">
                  <div className="flex gap-3">
                    {selectedPost.status === 'DRAFT' && (
                      <>
                        <Button
                          onClick={() => {
                            handleApprove(selectedPost.id);
                            closeModal();
                          }}
                          disabled={approveMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          {approveMutation.isPending ? 'Đang duyệt...' : 'Duyệt'}
                        </Button>
                        <Button
                          onClick={() => {
                            handleReject(selectedPost.id);
                            closeModal();
                          }}
                          disabled={rejectMutation.isPending}
                          variant="destructive"
                          className="flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          {rejectMutation.isPending ? 'Đang từ chối...' : 'Từ chối'}
                        </Button>
                      </>
                    )}
                    {selectedPost.status === 'PUBLISHED' && (
                      <Button
                        onClick={() => {
                          handleReject(selectedPost.id);
                          closeModal();
                        }}
                        disabled={rejectMutation.isPending}
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        {rejectMutation.isPending ? 'Đang từ chối...' : 'Từ chối'}
                      </Button>
                    )}
                  </div>
                  <Button onClick={closeModal} variant="outline">
                    Đóng
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
