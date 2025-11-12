'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ArchiveConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  postTitle: string;
  isArchiving?: boolean;
}

export default function ArchiveConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  postTitle,
  isArchiving = false,
}: ArchiveConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận Thu hồi Bài viết?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p className="font-medium text-foreground">Bài viết: {postTitle}</p>
            <p>
              Bài viết này sẽ bị gỡ khỏi trang. Phí dịch vụ của bạn sẽ được hệ thống tự động xem xét
              hoàn lại (hoặc giữ lại) theo chính sách chống bán chui và gian lận.
            </p>
            <p className="font-semibold">Bạn có chắc chắn muốn tiếp tục?</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isArchiving}>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isArchiving}>
            {isArchiving ? 'Đang xử lý...' : 'Xác nhận'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
