import { Post } from '@/types/api/post';

export interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onApprove: (postId: string) => void;
  onReject: (postId: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export const POST_STATUS_META = {
  DRAFT: { label: 'Bản nháp', cls: 'bg-gray-50 text-gray-700 border-gray-200' },
  PENDING_REVIEW: { label: 'Chờ duyệt', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  PUBLISHED: { label: 'Đã đăng', cls: 'bg-green-50 text-green-700 border-green-200' },
  REJECTED: { label: 'Từ chối', cls: 'bg-red-50 text-red-700 border-red-200' },
  PAUSED: { label: 'Tạm dừng', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  SOLD: { label: 'Đã bán', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  ARCHIVED: { label: 'Lưu trữ', cls: 'bg-gray-50 text-gray-700 border-gray-200' },
} as const;
