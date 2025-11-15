import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

interface RepublishSectionProps {
  postStatus: string;
  isProcessing: boolean;
  onRepublish: () => void;
}

export function RepublishSection({ postStatus, isProcessing, onRepublish }: RepublishSectionProps) {
  return (
    <>
      <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-green-900">Bài đăng đã được thanh toán</p>
            <p className="text-sm text-green-800 mt-1">
              {postStatus === 'REJECTED'
                ? 'Bài đăng của bạn đã bị từ chối trước đó. Bạn có thể sửa nội dung và gửi lại để chờ duyệt mà không cần thanh toán thêm.'
                : 'Bạn đã thanh toán phí đăng bài. Nhấn nút bên dưới để gửi bài đăng lên hệ thống.'}
            </p>
          </div>
        </div>
      </div>

      <Button
        onClick={onRepublish}
        className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          <>
            <CheckCircle className="h-5 w-5 mr-2" />
            {postStatus === 'REJECTED' ? 'GỬI LẠI BÀI ĐĂNG' : 'ĐĂNG BÀI'}
          </>
        )}
      </Button>
    </>
  );
}
