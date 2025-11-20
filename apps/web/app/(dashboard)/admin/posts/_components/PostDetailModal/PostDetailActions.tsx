import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { RejectDialog } from '../RejectDialog';

interface PostDetailActionsProps {
  postId: string;
  postStatus: string;
  verificationRequest?: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedAt: string;
    reviewedAt?: string;
    rejectReason?: string;
  };
  onApprove: (postId: number | string) => void;
  onReject: (postId: number | string, reason: string) => void;
  onVerify?: (postId: string) => void;
  onRejectVerification?: (postId: string, reason: string) => void;
  onClose: () => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  isVerifying?: boolean;
  isRejectingVerification?: boolean;
}

export function PostDetailActions({
  postId,
  postStatus,
  verificationRequest,
  onApprove,
  onReject,
  onVerify,
  onRejectVerification,
  onClose,
  isApproving = false,
  isRejecting = false,
  isVerifying = false,
  isRejectingVerification = false,
}: PostDetailActionsProps) {
  const isVerificationPending = verificationRequest?.status === 'PENDING';
  const isPendingReview = postStatus === 'PENDING_REVIEW';

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 -mx-6 mt-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isPendingReview && (
            <>
              <Button
                onClick={() => {
                  onApprove(postId);
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
              <RejectDialog
                onReject={async (reason: string) => {
                  await onReject(postId, reason);
                }}
                isRejecting={isRejecting}
                triggerVariant="lg"
                triggerClassName="bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 shadow-lg hover:shadow-xl transition-all duration-200"
              />
            </>
          )}

          {isVerificationPending && onVerify && onRejectVerification && (
            <>
              <Button
                onClick={() => {
                  onVerify(postId);
                }}
                disabled={isVerifying}
                size="lg"
                className="bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 px-8"
              >
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                {isVerifying ? 'Đang xử lý...' : 'Đạt yêu cầu'}
              </Button>
              <RejectDialog
                onReject={async (reason: string) => {
                  await onRejectVerification(postId, reason);
                }}
                isRejecting={isRejectingVerification}
                triggerVariant="lg"
                triggerClassName="bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 shadow-lg hover:shadow-xl transition-all duration-200"
                triggerText="Từ chối yêu cầu"
                dialogTitle="Từ chối yêu cầu kiểm định"
                dialogDescription="Vui lòng nhập lý do từ chối yêu cầu kiểm định này. Lý do sẽ được gửi đến người đăng."
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
