import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getMyPostReviewLog } from '@/lib/api/postReviewLogApi';
import { type PostReviewLog } from '@/types/post-review-log';
import { Loader2, AlertCircle } from 'lucide-react';

interface RejectReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  postTitle: string;
}

export default function RejectReasonDialog({
  open,
  onOpenChange,
  postId,
  postTitle,
}: RejectReasonDialogProps) {
  const {
    data: reviewLogs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['postReviewLogs', postId],
    queryFn: () => getMyPostReviewLog(Number(postId)),
    enabled: open,
  });

  // Find the rejection reason from the review logs
  const rejectionLog = Array.isArray(reviewLogs)
    ? reviewLogs.find((log: PostReviewLog) => log.action === 'REJECTED' && log.reason)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Lý do từ chối tin đăng
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
          ) : rejectionLog?.reason ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Đã từ chối</Badge>
                {rejectionLog.createdAt && (
                  <span className="text-sm text-muted-foreground">
                    {new Date(rejectionLog.createdAt).toLocaleDateString('vi-VN', {
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
              <div className="p-4 rounded-sm bg-zinc-300">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{rejectionLog.reason}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Không tìm thấy lý do từ chối cho tin đăng này
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
