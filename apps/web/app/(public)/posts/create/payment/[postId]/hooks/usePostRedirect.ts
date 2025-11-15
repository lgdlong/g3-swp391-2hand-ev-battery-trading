import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function usePostRedirect(post: { status: string } | undefined, isRefetchingPost: boolean) {
  const router = useRouter();

  useEffect(() => {
    // Don't run the effect while the post is being refetched
    if (isRefetchingPost) {
      return;
    }

    if (
      post &&
      post.status !== 'DRAFT' &&
      post.status !== 'PENDING_REVIEW' &&
      post.status !== 'REJECTED'
    ) {
      // Post is already fully processed (APPROVED, PUBLISHED, etc.)
      toast.info('Bài đăng này đã được xử lý', {
        description: 'Bạn sẽ được chuyển hướng tới trang quản lý bài đăng',
        duration: 3000,
      });
      router.push('/my-posts');
    }
  }, [post, router, isRefetchingPost]);
}
