import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

interface EmptyStateProps {
  status: string;
}

export default function EmptyState({ status }: EmptyStateProps) {
  const getMessage = () => {
    switch (status) {
      case 'PENDING_REVIEW':
        return 'Không có tin nào đang chờ duyệt';
      case 'PUBLISHED':
        return 'Bạn chưa có tin nào đang hiển thị';
      case 'REJECTED':
        return 'Không có tin nào bị từ chối';
      case 'SOLD':
        return 'Bạn chưa bán được sản phẩm nào';
      default:
        return 'Chưa có tin nào trong mục này';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FileText className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">Chưa có tin nào trong mục này</h3>
      <p className="text-sm text-muted-foreground mb-6">{getMessage()}</p>
      <Button className="gap-2">
        <Plus className="h-4 w-4" />
        Đăng tin mới
      </Button>
    </div>
  );
}
