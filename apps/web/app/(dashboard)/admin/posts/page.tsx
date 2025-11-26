'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { getAdminPosts } from '@/lib/api/postApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Post, PostsResponse, PostStatus } from '@/types/api/post';

// Import các component đã tách
import {
  StatusSummaryCards,
  FilterButtons,
  PostCard,
  PostDetailModal,
  PageSizeSelector,
} from './_components';
import type { AdminPostFilter } from './_components/FilterButtons';
import { useModeration } from '@/hooks/useModeration';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

// Error interface for API errors
export default function AdminPostsPage() {
  const [currentFilter, setCurrentFilter] = useState<AdminPostFilter>('PENDING_REVIEW');

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageSize, setPageSize] = useState(() => {
    // Get page size from localStorage or default to 10
    if (typeof window !== 'undefined') {
      const savedPageSize = localStorage.getItem('admin-posts-page-size');
      return savedPageSize ? parseInt(savedPageSize) : 10;
    }
    return 10;
  });
  const [pendingApproveId, setPendingApproveId] = useState<string | null>(null);
  const [pendingRejectData, setPendingRejectData] = useState<{
    postId: string;
    reason: string;
  } | null>(null);
  const queryClient = useQueryClient();
  const { approve, reject, isApproving, isRejecting } = useModeration(currentFilter, 1);

  // Fetch posts based on current filter
  const {
    data: postsData,
    isLoading,
    error,
    refetch,
  } = useQuery<PostsResponse>({
    queryKey: ['admin-posts', currentFilter, pageSize],
    queryFn: () =>
      getAdminPosts({
        status: currentFilter as PostStatus,
        page: 1,
        limit: pageSize,
        order: 'DESC',
        sort: 'createdAt',
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });


  // Get status counts with caching - lấy tất cả để đếm đúng số lượng
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

  const pendingReviewCount = pendingReviewData?.total || 0;
  const publishedCount = publishedData?.total || 0;
  const rejectedCount = rejectedData?.total || 0;

  const filteredPosts = postsData?.data ?? [];

  const handleApprove = async (postId: number | string) => {
    setPendingApproveId(String(postId));
  };

  const handleReject = async (postId: number | string, reason: string) => {
    if (!reason?.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    setPendingRejectData({ postId: String(postId), reason });
  };

  const confirmApprove = () => {
    if (pendingApproveId) {
      approve(pendingApproveId);
      setPendingApproveId(null);
    }
  };

  const confirmReject = () => {
    if (pendingRejectData) {
      reject(pendingRejectData.postId, pendingRejectData.reason);
      setPendingRejectData(null);
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

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);

    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-posts-page-size', newPageSize.toString());
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);

      // Invalidate và refetch tất cả queries để cập nhật dữ liệu mới
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-posts'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-posts-count'] }),
        // Invalidate public posts pages
        queryClient.invalidateQueries({ queryKey: ['carPosts'] }),
        queryClient.invalidateQueries({ queryKey: ['bikePosts'] }),
        queryClient.invalidateQueries({ queryKey: ['batteryPosts'] }),
        refetch(),
      ]);

      // Hiển thị thông báo
      toast.success('Đã làm mới dữ liệu thành công!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Có lỗi xảy ra khi làm mới dữ liệu!');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full px-8 py-6 space-y-6">
        {/* Status Summary Cards */}
        <StatusSummaryCards
          counts={{
            pendingReviewCount,
            publishedCount,
            rejectedCount,
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
              }}
              counts={{
                pendingReviewCount,
                publishedCount,
                rejectedCount,
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

            {!isLoading && !error && filteredPosts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Không có tin đăng nào trong danh mục này.</p>
              </div>
            )}

            {!isLoading && !error && filteredPosts.length > 0 && (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onViewDetails={handleViewDetails}
                  />
                ))}

                {/* Page Size Selector - show for all filters */}
                <PageSizeSelector
                  totalItems={postsData?.total || 0}
                  itemsPerPage={pageSize}
                  onPageSizeChange={handlePageSizeChange}
                  isLoading={isLoading}
                />
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
          isApproving={isApproving}
          isRejecting={isRejecting}
        />

        {/* Confirmation Dialogs */}
        <ConfirmationDialog
          title="Xác nhận duyệt bài viết"
          description="Bạn có chắc muốn duyệt bài viết này?"
          confirmText="Duyệt"
          onConfirm={confirmApprove}
          open={!!pendingApproveId}
          onOpenChange={(open: boolean) => !open && setPendingApproveId(null)}
        />

        <ConfirmationDialog
          title="Xác nhận từ chối bài viết"
          description="Bạn có chắc muốn từ chối bài viết này?"
          confirmText="Từ chối"
          variant="destructive"
          onConfirm={confirmReject}
          open={!!pendingRejectData}
          onOpenChange={(open: boolean) => !open && setPendingRejectData(null)}
        />
      </main>
    </div>
  );
}
