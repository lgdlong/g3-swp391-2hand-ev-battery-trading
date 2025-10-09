'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { getAdminPosts, approvePost, rejectPost } from '@/lib/api/postApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Post, PostsResponse, PostStatus } from '@/types/api/post';

// Import các component đã tách
import { 
  AdminHeader, 
  StatusSummaryCards, 
  FilterButtons, 
  PostCard, 
  PostDetailModal 
} from './_components';


export default function AdminPostsPage() {
  const [currentFilter, setCurrentFilter] = useState<PostStatus>('PENDING_REVIEW');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const queryClient = useQueryClient();

  // Fetch posts based on current filter
  const {
    data: postsData,
    isLoading,
    error,
    refetch,
  } = useQuery<PostsResponse>({
    queryKey: ['admin-posts', currentFilter, currentPage],
    queryFn: () =>
      getAdminPosts({
        status: currentFilter,
        page: currentPage,
        limit: pageSize,
        order: 'DESC',
        sort: 'createdAt',
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  console.log(postsData);
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

  const { data: pendingReviewData } = useQuery<PostsResponse>({
    queryKey: ['admin-posts-count', 'PENDING_REVIEW'],
    queryFn: () => getAdminPosts({ status: 'PENDING_REVIEW', limit: 1000 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: publishedData } = useQuery<PostsResponse>({
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
  const pendingReviewCount = pendingReviewData?.total || 0;
  const publishedCount = publishedData?.total || 0;
  const rejectedCount = rejectedData?.total || 0;

  // Debug log để kiểm tra số lượng
  console.log('Counts:', { draftCount, pendingReviewCount, publishedCount, rejectedCount });
  console.log('Data:', { draftData, pendingReviewData, publishedData, rejectedData });

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

  const handleViewDetails = (post: Post) => {
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
        refetch(),
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


  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full px-8 py-6 space-y-6">
        {/* Header */}
        <AdminHeader />

        {/* Status Summary Cards */}
        <StatusSummaryCards 
          counts={{
            draftCount,
            pendingReviewCount,
            publishedCount,
            rejectedCount
          }}
        />

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
            <FilterButtons
              currentFilter={currentFilter}
              onFilterChange={(filter) => {
                setCurrentFilter(filter);
                  setCurrentPage(1);
                }}
              counts={{
                draftCount,
                pendingReviewCount,
                publishedCount,
                rejectedCount
              }}
            />

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
                  <PostCard
                    key={post.id}
                    post={post}
                    onViewDetails={handleViewDetails}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isApproving={approveMutation.isPending}
                    isRejecting={rejectMutation.isPending}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal chi tiết bài đăng */}
        <PostDetailModal
          isOpen={showModal}
          onClose={closeModal}
          post={selectedPost}
          onApprove={handleApprove}
          onReject={handleReject}
          isApproving={approveMutation.isPending}
          isRejecting={rejectMutation.isPending}
        />
      </main>
    </div>
  );
}
