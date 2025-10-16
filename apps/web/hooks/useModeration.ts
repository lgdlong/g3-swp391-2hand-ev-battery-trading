'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approvePost, rejectPost } from '@/lib/api/postApi';
import { toast } from 'sonner';

export function useModeration(currentFilter?: string, currentPage?: number) {
  const qc = useQueryClient();

  const invalidateNarrow = () => {
    // chỉ invalid danh sách hiện tại
    if (currentFilter && currentPage) {
      qc.invalidateQueries({ queryKey: ['admin-posts', currentFilter, currentPage] });
    } else {
      qc.invalidateQueries({ queryKey: ['admin-posts'] });
    }
    // đếm theo status: chỉ invalid cái có khả năng bị ảnh hưởng
    qc.invalidateQueries({ queryKey: ['admin-posts-count', 'PENDING_REVIEW'] });
    qc.invalidateQueries({ queryKey: ['admin-posts-count', 'REJECTED'] });
    qc.invalidateQueries({ queryKey: ['admin-posts-count', 'PUBLISHED'] });
  };

  const approve = useMutation({
    mutationFn: (postId: string | number) => approvePost(String(postId)),
    onSuccess: () => {
      invalidateNarrow();
      toast.success('Duyệt bài viết thành công!');
    },
    onError: () => toast.error('Có lỗi xảy ra khi duyệt bài viết!'),
  });

  const reject = useMutation({
    mutationFn: ({ postId, reason }: { postId: string | number; reason: string }) =>
      // API backend nên nhận cả reason, nếu chưa có — thêm vào
      rejectPost(String(postId), reason),
    onSuccess: () => {
      invalidateNarrow();
      toast.success('Từ chối bài viết thành công!');
    },
    onError: () => toast.error('Có lỗi xảy ra khi từ chối bài viết!'),
  });

  return {
    approve: (postId: string | number) => approve.mutate(postId),
    reject: (postId: string | number, reason: string) => reject.mutate({ postId, reason }),
    isApproving: approve.isPending,
    isRejecting: reject.isPending,
  };
}
