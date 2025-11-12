'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RefundCase } from '@/types/refund';

interface RefundCaseDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refundCase: RefundCase | null;
  onAction: (refundCase: RefundCase) => void;
}

// Badge color mapping
const STATUS_BADGE_CONFIG = {
  PENDING: {
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
  REFUNDED: {
    variant: 'secondary' as const,
    className: 'bg-green-100 text-green-800 hover:bg-green-200',
  },
  REJECTED: {
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 hover:bg-red-200',
  },
  FAILED: {
    variant: 'outline' as const,
    className: '',
  },
} as const;

const SCENARIO_BADGE_CONFIG = {
  FRAUD_SUSPECTED: 'destructive' as const,
  CANCEL_EARLY: 'secondary' as const,
  CANCEL_LATE: 'secondary' as const,
  EXPIRED: 'secondary' as const,
} as const;

export function RefundCaseDetailDialog({
  open,
  onOpenChange,
  refundCase,
  onAction,
}: RefundCaseDetailDialogProps) {
  if (!refundCase) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết hoàn tiền</DialogTitle>
          <DialogDescription>Thông tin chi tiết về yêu cầu hoàn tiền</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header với status badge */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-lg font-semibold">ID Hoàn tiền: {refundCase.id}</h3>
              <p className="text-sm text-muted-foreground">ID Bài đăng: {refundCase.postId}</p>
            </div>
            <Badge
              variant={
                STATUS_BADGE_CONFIG[refundCase.status as keyof typeof STATUS_BADGE_CONFIG]
                  ?.variant || 'outline'
              }
              className={
                STATUS_BADGE_CONFIG[refundCase.status as keyof typeof STATUS_BADGE_CONFIG]
                  ?.className || ''
              }
            >
              {refundCase.status}
            </Badge>
          </div>

          {/* Thông tin người dùng */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Người dùng</h4>
              <div className="space-y-1">
                <p className="font-medium">{refundCase.account?.email}</p>
                {refundCase.account?.fullName && (
                  <p className="text-sm text-muted-foreground">{refundCase.account.fullName}</p>
                )}
              </div>
            </div>

            {/* Thông tin bài đăng */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Bài đăng</h4>
              {refundCase.post?.title && <p className="font-medium">{refundCase.post.title}</p>}
              <p className="text-xs text-muted-foreground">ID: {refundCase.post?.id}</p>
            </div>
          </div>

          {/* Thông tin hoàn tiền */}
          <div className="grid gap-4 md:grid-cols-3 bg-muted/50 rounded-lg p-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Số tiền gốc</p>
              <p className="text-lg font-semibold">
                {Number.parseFloat(refundCase.amountOriginal).toLocaleString('vi-VN')} VND
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Tỷ lệ hoàn</p>
              <p className="text-lg font-semibold">{refundCase.policyRatePercent}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Số tiền hoàn</p>
              <p className="text-lg font-semibold text-green-600">
                {Number.parseFloat(refundCase.amountRefund).toLocaleString('vi-VN')} VND
              </p>
            </div>
          </div>

          {/* Kịch bản và lý do */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Tình huống</h4>
              <Badge
                variant={
                  SCENARIO_BADGE_CONFIG[
                    refundCase.scenario as keyof typeof SCENARIO_BADGE_CONFIG
                  ] || 'secondary'
                }
              >
                {refundCase.scenario.replace(/_/g, ' ')}
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Lý do</h4>
              <p className="text-sm whitespace-pre-wrap rounded-lg bg-muted p-3">
                {refundCase.reason || 'Auto refund - không có lý do được ghi lại'}
              </p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid gap-4 md:grid-cols-2 border-t pt-4 text-xs text-muted-foreground">
            <div>
              <p className="font-medium">Ngày tạo</p>
              <p>{new Date(refundCase.createdAt).toLocaleString('vi-VN')}</p>
            </div>
            {refundCase.refundedAt && (
              <div>
                <p className="font-medium">Ngày hoàn</p>
                <p>{new Date(refundCase.refundedAt).toLocaleString('vi-VN')}</p>
              </div>
            )}
          </div>

          {/* Action button */}
          {refundCase.status === 'PENDING' && (
            <Button
              className="w-full"
              onClick={() => {
                onAction(refundCase);
                onOpenChange(false);
              }}
            >
              Giải quyết hoàn tiền
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
