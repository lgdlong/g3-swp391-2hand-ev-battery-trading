'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { getAdminPosts, rejectPost } from '@/lib/api/postApi';
import {
  verifyPost,
  rejectPostVerification,
  getPendingVerificationRequests,
  getRejectedVerificationRequests,
} from '@/lib/api/verificationApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
interface ApiError {
  code?: string;
  response?: {
    status?: number;
  };
}

export default function AdminPostsPage() {
  const [currentFilter, setCurrentFilter] = useState<AdminPostFilter>('PENDING_REVIEW');

  // Debug authentication
  console.log('AdminPostsPage - currentFilter:', currentFilter);
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
    queryFn: () => {
      // For verification filters, we fetch all posts (no status filter)
      const status = ['VERIFICATION_PENDING', 'VERIFICATION_REJECTED'].includes(currentFilter)
        ? undefined
        : currentFilter;
      const limit = ['VERIFICATION_PENDING', 'VERIFICATION_REJECTED'].includes(currentFilter)
        ? 1000
        : pageSize;
      console.log('Admin page - fetching posts with:', {
        status,
        page: 1,
        limit,
        order: 'DESC',
        sort: 'createdAt',
      });
      return getAdminPosts({
        status: status as PostStatus,
        page: 1,
        limit,
        order: 'DESC',
        sort: 'createdAt',
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Debug logging
  console.log('Admin page - postsData:', postsData);
  console.log('Admin page - isLoading:', isLoading);
  console.log('Admin page - error:', error);

  // Verify post mutation
  const verifyMutation = useMutation({
    mutationFn: (postId: string) => verifyPost(postId),
    onSuccess: () => {
      // Refresh all queries to update counts and lists
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-posts-count'] });
      queryClient.invalidateQueries({ queryKey: ['admin-verification-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-rejected-verification-requests'] });
      // Invalidate public posts pages
      queryClient.invalidateQueries({ queryKey: ['carPosts'] });
      queryClient.invalidateQueries({ queryKey: ['bikePosts'] });
      queryClient.invalidateQueries({ queryKey: ['batteryPosts'] });
      toast.success('Duyệt bài viết thành công!');
    },
    onError: (error) => {
      console.error('Error approving post:', error);
      toast.error('Có lỗi xảy ra khi duyệt bài viết!');
    },
  });

  // Reject post mutation (for regular post rejection)
  const rejectMutation = useMutation({
    mutationFn: ({ postId, reason }: { postId: string; reason: string }) =>
      rejectPost(postId, reason),
    onSuccess: () => {
      // Refresh all queries to update counts and lists
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-posts-count'] });
      toast.success('Từ chối bài viết thành công!');
    },
    onError: (error) => {
      console.error('Error rejecting post:', error);
      toast.error('Có lỗi xảy ra khi từ chối bài viết!');
    },
  });

  // Reject verification mutation
  const rejectVerificationMutation = useMutation({
    mutationFn: ({ postId, reason }: { postId: string; reason: string }) =>
      rejectPostVerification(postId, reason),
    onSuccess: () => {
      // Refresh all queries to update counts and lists
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-posts-count'] });
      queryClient.invalidateQueries({ queryKey: ['admin-verification-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-rejected-verification-requests'] });
      // Invalidate public posts pages
      queryClient.invalidateQueries({ queryKey: ['carPosts'] });
      queryClient.invalidateQueries({ queryKey: ['bikePosts'] });
      queryClient.invalidateQueries({ queryKey: ['batteryPosts'] });
      toast.success('Từ chối kiểm định thành công!');
    },
    onError: (error: unknown) => {
      console.error('Error rejecting verification:', error);

      // Type assertion for error handling
      const err = error as ApiError;

      // Check if it's an authentication error
      if (err?.code === 'TOKEN_EXPIRED' || err?.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        // Redirect to login
        window.location.href = '/login';
        return;
      }

      // Check if it's a permission error
      if (err?.response?.status === 403) {
        toast.error('Bạn không có quyền thực hiện hành động này.');
        return;
      }

      // Generic error
      toast.error('Có lỗi xảy ra khi từ chối yêu cầu kiểm định xe/pin!');
    },
  });

  // Approve post mutation (alias for verifyMutation)
  const approveMutation = verifyMutation;

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

  // Query for verification requests (using new API)
  const { data: verificationRequestsData } = useQuery({
    queryKey: ['admin-verification-requests'],
    queryFn: () => getPendingVerificationRequests(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Debug verification requests
  console.log('Admin page - verificationRequestsData:', verificationRequestsData);

  // Query for rejected verification requests
  const { data: rejectedVerificationRequestsData } = useQuery({
    queryKey: ['admin-rejected-verification-requests'],
    queryFn: () => getRejectedVerificationRequests(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const draftCount = draftData?.total || 0;
  const pendingReviewCount = pendingReviewData?.total || 0;
  const publishedCount = publishedData?.total || 0;
  const rejectedCount = rejectedData?.total || 0;

  // Count verification requests using new API
  const verificationRequestsCount = verificationRequestsData?.length || 0;

  // Count rejected verification requests using new API
  const verificationRejectedCount = rejectedVerificationRequestsData?.length || 0;

  // Filter posts for verification pending and rejected
  const filteredPosts = useMemo(() => {
    console.log('Filtering posts - postsData:', postsData);
    console.log('Filtering posts - currentFilter:', currentFilter);
    console.log('Filtering posts - verificationRequestsData:', verificationRequestsData);
    console.log(
      'Filtering posts - rejectedVerificationRequestsData:',
      rejectedVerificationRequestsData,
    );

    if (!postsData?.data) {
      console.log('No postsData.data, returning empty array');
      return [];
    }

    if (currentFilter === 'VERIFICATION_PENDING') {
      // Get post IDs from pending verification requests
      const pendingPostIds = verificationRequestsData?.map((req) => req.postId) || [];
      console.log('VERIFICATION_PENDING - pendingPostIds:', pendingPostIds);
      console.log('VERIFICATION_PENDING - postsData.data:', postsData.data);
      console.log(
        'VERIFICATION_PENDING - post.id types:',
        postsData.data.map((post) => ({ id: post.id, type: typeof post.id })),
      );
      console.log(
        'VERIFICATION_PENDING - pendingPostIds types:',
        pendingPostIds.map((id) => ({ id, type: typeof id })),
      );
      console.log('VERIFICATION_PENDING - detailed comparison:');
      postsData.data.forEach((post, index) => {
        console.log(`Post ${index}:`, {
          id: post.id,
          idType: typeof post.id,
          idValue: post.id,
          pendingIds: pendingPostIds,
          includesDirect: pendingPostIds.includes(post.id),
          includesString: pendingPostIds.includes(String(post.id)),
          includesNumber: pendingPostIds.includes(Number(post.id)),
          stringId: String(post.id),
          numberId: Number(post.id),
        });
      });
      // Handle both string and number types
      const filtered = postsData.data.filter(
        (post) =>
          pendingPostIds.includes(post.id) ||
          pendingPostIds.includes(String(post.id)) ||
          pendingPostIds.includes(Number(post.id)),
      );
      console.log('VERIFICATION_PENDING - filtered posts:', filtered);
      return filtered;
    }

    if (currentFilter === 'VERIFICATION_REJECTED') {
      // Get post IDs from rejected verification requests
      const rejectedPostIds = rejectedVerificationRequestsData?.map((req) => req.postId) || [];
      console.log('VERIFICATION_REJECTED - rejectedPostIds:', rejectedPostIds);
      // Handle both string and number types
      const filtered = postsData.data.filter(
        (post) =>
          rejectedPostIds.includes(post.id) ||
          rejectedPostIds.includes(String(post.id)) ||
          rejectedPostIds.includes(Number(post.id)),
      );
      console.log('VERIFICATION_REJECTED - filtered posts:', filtered);
      return filtered;
    }

    console.log('Regular filter - returning all posts:', postsData.data);
    return postsData.data;
  }, [postsData, currentFilter, verificationRequestsData, rejectedVerificationRequestsData]);

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

  const handleVerify = (postId: string) => {
    if (confirm('Bạn có chắc chắn muốn kiểm định bài viết này?')) {
      verifyMutation.mutate(postId);
    }
  };

  const handleRejectVerification = (postId: string) => {
    const reason = prompt('Lý do từ chối yêu cầu kiểm định (tùy chọn):');
    if (confirm('Bạn có chắc chắn muốn từ chối yêu cầu kiểm định bài viết này?')) {
      rejectVerificationMutation.mutate({ postId, reason: reason || '' });
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
        queryClient.invalidateQueries({ queryKey: ['admin-verification-requests'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-rejected-verification-requests'] }),
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
            draftCount,
            pendingReviewCount,
            publishedCount,
            rejectedCount,
            verificationRequestsCount,
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
                draftCount,
                pendingReviewCount,
                publishedCount,
                rejectedCount,
                verificationRequestsCount,
                verificationRejectedCount,
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
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onVerify={handleVerify}
                    onRejectVerification={handleRejectVerification}
                    isApproving={approveMutation.isPending}
                    isRejecting={rejectMutation.isPending}
                    isVerifying={verifyMutation.isPending}
                    isRejectingVerification={rejectVerificationMutation.isPending}
                    currentFilter={currentFilter}
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
