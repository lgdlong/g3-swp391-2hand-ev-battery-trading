'use client';

import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface FeeTierActionsProps {
  deletingTierId: number | null;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

export function FeeTierActions({
  deletingTierId,
  onConfirmDelete,
  onCancelDelete,
}: FeeTierActionsProps) {
  return (
    <ConfirmationDialog
      title="Xác nhận xóa"
      description="Bạn có chắc chắn muốn xóa hoa hồng này? Hành động này không thể hoàn tác."
      confirmText="Xóa"
      variant="destructive"
      onConfirm={onConfirmDelete}
      open={!!deletingTierId}
      onOpenChange={(open) => !open && onCancelDelete()}
    />
  );
}
