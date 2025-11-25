import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { RejectDialog } from '../RejectDialog';

interface PostDetailActionsProps {
  postId: string;
  postStatus: string;
  onApprove: (postId: number | string) => void;
  onReject: (postId: number | string, reason: string) => void;
  onClose: () => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  canApprove?: boolean;
  approveDisabledReason?: string;
}

export function PostDetailActions({
  postId,
  postStatus,
  onApprove,
  onReject,
  onClose,
  isApproving = false,
  isRejecting = false,
  canApprove = true,
  approveDisabledReason,
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
                disabled={isApproving || !canApprove}
                size="lg"
                className="bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 px-8"
              >
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                {isApproving
                  ? 'Đang duyệt...'
                  : canApprove
                    ? 'Duyệt bài đăng'
                    : 'Thiếu giấy tờ'}
              </Button>
              {!canApprove && approveDisabledReason && (
                <p className="text-xs text-red-500">{approveDisabledReason}</p>
              )}
              <RejectDialog
                onReject={async (reason: string) => {
                  await onReject(postId, reason);
                  onClose();
                }}
                isRejecting={isRejecting}
                triggerVariant="lg"
                triggerClassName="bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 shadow-lg hover:shadow-xl transition-all duration-200"
              />
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
