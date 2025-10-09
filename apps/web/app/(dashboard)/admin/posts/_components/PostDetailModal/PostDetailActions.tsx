import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface PostDetailActionsProps {
  postId: string;
  postStatus: string;
  onApprove: (postId: string) => void;
  onReject: (postId: string) => void;
  onClose: () => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export function PostDetailActions({
  postId,
  postStatus,
  onApprove,
  onReject,
  onClose,
  isApproving = false,
  isRejecting = false,
}: PostDetailActionsProps) {
  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 -mx-6 mt-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {postStatus === 'PENDING_REVIEW' && (
            <>
              <Button
                onClick={() => {
                  onApprove(postId);
                  onClose();
                }}
                disabled={isApproving}
                size="lg"
                className="bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 px-8"
              >
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                {isApproving ? 'Đang duyệt...' : 'Duyệt bài đăng'}
              </Button>
              <Button
                onClick={() => {
                  onReject(postId);
                  onClose();
                }}
                disabled={isRejecting}
                variant="destructive"
                size="lg"
                className="bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 px-8"
              >
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-3 h-3 text-red-600" />
                </div>
                {isRejecting ? 'Đang từ chối...' : 'Từ chối bài đăng'}
              </Button>
            </>
          )}
        </div>
        <Button
          onClick={onClose}
          variant="outline"
          size="lg"
          className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 px-8"
        >
          Đóng
        </Button>
      </div>
    </div>
  );
}
