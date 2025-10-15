'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getPostById } from '@/lib/api/postApi';
import { useAuth } from '@/lib/auth-context';
import UpdatePostForm from './_components/UpdatePostForm';
import { useEffect } from 'react';

export default function UpdatePostPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const postId = params.id as string;

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      toast.error('Vui lòng đăng nhập để chỉnh sửa tin đăng');
      router.push('/login');
    }
  }, [isLoggedIn, authLoading, router]);

  // Fetch post data
  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId && isLoggedIn,
    retry: 1,
  });

  // Handle loading states
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải thông tin tin đăng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Lỗi</h1>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : 'Không thể tải thông tin tin đăng'}
          </p>
          <Button onClick={() => router.push('/my-posts')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách tin đăng
          </Button>
        </div>
      </div>
    );
  }

  // Check if user can edit this post
  if (post.status !== 'DRAFT' && post.status !== 'REJECTED') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Không thể chỉnh sửa</h1>
          <p className="text-muted-foreground mb-6">
            Chỉ có thể chỉnh sửa tin đăng ở trạng thái Bản nháp hoặc Bị từ chối
          </p>
          <Button onClick={() => router.push('/my-posts')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách tin đăng
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button onClick={() => router.push('/my-posts')} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách tin đăng
        </Button>

        <h1 className="text-3xl font-bold">Chỉnh sửa tin đăng</h1>
        <p className="text-muted-foreground mt-2">Cập nhật thông tin tin đăng của bạn</p>
      </div>

      {/* Update Form */}
      <UpdatePostForm post={post} />
    </div>
  );
}
