'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Post, PostStatus } from '@/types/post';
import { getMyPosts, deletePost, updatePost } from '@/lib/api/postApi';
import { useAuth } from '@/lib/auth-context';
import SearchBar from './_components/search-bar';
import PostListItem from './_components/post-list-item';
import PostDetailDialog from './_components/post-detail-dialog';
import DeleteConfirmDialog from './_components/delete-confirm-dialog';
import RejectReasonDialog from './_components/reject-reason-dialog';
import EmptyState from './_components/empty-state';
import PostListSkeleton from './_components/post-list-skeleton';
import Pagination from './_components/pagination';

export default function MyPostsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isLoggedIn, loading } = useAuth();

  // Redirect if not logged in - but wait for auth to initialize
  useEffect(() => {
    // Don't redirect if still loading auth state
    if (loading) {
      return;
    }

    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để xem tin đăng của bạn');
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);

  const [activeTab, setActiveTab] = useState<PostStatus>('PENDING_REVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-asc' | 'price-desc'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [postToView, setPostToView] = useState<Post | null>(null);
  const [rejectReasonDialogOpen, setRejectReasonDialogOpen] = useState(false);
  const [postForRejectReason, setPostForRejectReason] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const itemsPerPage = 6;

  const {
    data: postsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['myPosts', activeTab, currentPage, searchQuery, sortBy],
    queryFn: async () => {
      try {
        return await getMyPosts({
          status: activeTab,
          page: currentPage,
          limit: itemsPerPage,
          q: searchQuery || undefined,
          order: sortBy === 'newest' || sortBy === 'price-desc' ? 'DESC' : 'ASC',
          sort:
            sortBy === 'price-asc' || sortBy === 'price-desc'
              ? 'priceVnd'
              : sortBy === 'newest' || sortBy === 'oldest'
                ? 'createdAt'
                : undefined,
        });
      } catch (err) {
        console.error('Error fetching my posts:', err);
        // Check if it's an authentication error
        if (err && typeof err === 'object' && 'response' in err) {
          const response = (err as { response?: { status?: number } }).response;
          if (response?.status === 401 || response?.status === 403) {
            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            router.push('/login');
          }
        }
        throw err;
      }
    },
    enabled: isLoggedIn, // Only run query if user is logged in
    retry: 1, // Only retry once
  });

  // Process data
  const getPostCounts = () => ({ DRAFT: 0, PENDING_REVIEW: 0, PUBLISHED: 0, REJECTED: 0, SOLD: 0 });
  const counts = getPostCounts();
  const posts = postsData || [];
  const totalPages = 1; // For now, since we're returning array directly

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      toast.success('Đã xóa tin đăng thành công');
      queryClient.invalidateQueries({ queryKey: ['myPosts'] });
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    },
    onError: () => {
      toast.error('Xóa tin đăng thất bại. Vui lòng thử lại.');
    },
  });

  const markAsSoldMutation = useMutation({
    mutationFn: (postId: string) => updatePost(postId, { status: 'SOLD' }),
    onSuccess: () => {
      toast.success('Đã đánh dấu bài đăng là đã bán');
      queryClient.invalidateQueries({ queryKey: ['myPosts'] });
    },
    onError: () => {
      toast.error('Cập nhật trạng thái thất bại. Vui lòng thử lại.');
    },
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as PostStatus);
    setCurrentPage(1);
  };
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };
  const handleDelete = (postId: string) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = () => {
    if (postToDelete) {
      deleteMutation.mutate(postToDelete);
    }
  };
  const handleViewDetail = (post: Post) => {
    setPostToView(post);
    setViewDialogOpen(true);
  };
  const handleMarkAsSold = (postId: string) => {
    markAsSoldMutation.mutate(postId);
  };
  const handleEdit = (postId: string) => {
    router.push(`/posts/${postId}/edit`);
  };
  const handleCreateNew = () => {
    router.push('/posts/create');
  };
  const handleViewRejectReason = (postId: string, postTitle: string) => {
    setPostForRejectReason({ id: postId, title: postTitle });
    setRejectReasonDialogOpen(true);
  };

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang kiểm tra trạng thái đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background md:p-8">
        <div className="mx-auto max-w-6xl p-6 bg-white rounded-2xl shadow">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Quản lý tin đăng</h1>
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onCreateNew={handleCreateNew}
            />
          </div>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-3/5 grid-cols-4 mb-8 p-1 h-auto bg-background">
              <TabsTrigger
                value="PENDING_REVIEW"
                className="gap-2 text-base font-semibold h-full data-[state=active]:bg-white"
              >
                Chờ duyệt
                {counts.PENDING_REVIEW > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
                    {counts.PENDING_REVIEW}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="PUBLISHED"
                className="gap-2 text-base font-semibold h-full data-[state=active]:bg-white"
              >
                Đang hiển thị
                {counts.PUBLISHED > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
                    {counts.PUBLISHED}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="REJECTED"
                className="gap-2 text-base font-semibold h-full data-[state=active]:bg-white"
              >
                Bị từ chối
                {counts.REJECTED > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
                    {counts.REJECTED}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="SOLD"
                className="gap-2 text-base font-semibold h-full data-[state=active]:bg-white"
              >
                Đã bán
                {counts.SOLD > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
                    {counts.SOLD}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            {(['PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'SOLD'] as PostStatus[]).map((status) => (
              <TabsContent key={status} value={status} className="mt-0">
                {isLoading ? (
                  <PostListSkeleton />
                ) : error ? (
                  <div className="text-center py-16 space-y-4">
                    <p className="text-destructive text-lg font-medium">
                      Đã xảy ra lỗi khi tải dữ liệu
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {error instanceof Error
                        ? error.message
                        : 'Vui lòng thử lại sau hoặc liên hệ hỗ trợ'}
                    </p>
                    <button
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['myPosts'] })}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : posts.length === 0 ? (
                  <EmptyState status={status} />
                ) : (
                  <>
                    <div className="space-y-0">
                      {posts.map((post, index) => (
                        <div key={post.id} className={index !== posts.length - 1 ? 'border-b' : ''}>
                          <PostListItem
                            post={post}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onView={handleViewDetail}
                            onMarkAsSold={handleMarkAsSold}
                            onViewRejectReason={handleViewRejectReason}
                          />
                        </div>
                      ))}
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
        />
        <PostDetailDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          post={postToView}
        />
        <RejectReasonDialog
          open={rejectReasonDialogOpen}
          onOpenChange={setRejectReasonDialogOpen}
          postId={postForRejectReason?.id || ''}
          postTitle={postForRejectReason?.title || ''}
        />
      </div>
    </TooltipProvider>
  );
}
