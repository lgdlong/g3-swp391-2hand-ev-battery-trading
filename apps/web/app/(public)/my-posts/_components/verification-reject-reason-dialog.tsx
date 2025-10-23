'use client';

import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2 } from 'lucide-react';
import { getPostVerificationRequest } from '@/lib/api/verificationApi';

interface VerificationRejectReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  postTitle: string;
}

export default function VerificationRejectReasonDialog({
  open,
  onOpenChange,
  postId,
  postTitle,
}: VerificationRejectReasonDialogProps) {
  const {
    data: verificationRequest,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['verification-request', postId],
    queryFn: () => getPostVerificationRequest(postId),
    enabled: open,
    retry: false,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Lý do từ chối kiểm định
          </DialogTitle>
          <DialogDescription className="text-left">
            Tin đăng: <span className="font-medium text-foreground">{postTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Đang tải thông tin...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Không thể tải thông tin lý do từ chối</p>
            </div>
          ) : verificationRequest?.rejectReason ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Đã từ chối</Badge>
                {verificationRequest?.rejectedAt && (
                  <span className="text-sm text-muted-foreground">
                    {new Date(verificationRequest.rejectedAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>

              <h4 className="font-medium mb-2 text-foreground">Lý do từ chối:</h4>
              <div className="p-4 rounded-sm bg-orange-100 border border-orange-200">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-orange-800">
                  {verificationRequest.rejectReason}
                </p>
              </div>

              {verificationRequest?.rejectedBy?.displayName && (
                <p className="text-xs text-muted-foreground">
                  Từ chối bởi: {verificationRequest.rejectedBy.displayName}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Không tìm thấy lý do từ chối</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
