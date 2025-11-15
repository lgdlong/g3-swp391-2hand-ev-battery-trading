import { AlertCircle } from 'lucide-react';

interface PaymentInfoNotesProps {
  isAlreadyPaid: boolean;
  isDraftOrRejected: boolean;
}

export function PaymentInfoNotes({ isAlreadyPaid, isDraftOrRejected }: PaymentInfoNotesProps) {
  if (!isAlreadyPaid) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Lưu ý:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Sau khi thanh toán, bài đăng sẽ chuyển sang trạng thái chờ duyệt</li>
              <li>Bạn có thể upload hình ảnh sau khi thanh toán thành công</li>
              <li>Phí đăng bài không được hoàn lại</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (isAlreadyPaid && isDraftOrRejected) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Lưu ý:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Bạn đã thanh toán phí đăng bài trước đó, không cần thanh toán lại</li>
              <li>Sau khi gửi lại, bài đăng sẽ chuyển sang trạng thái chờ duyệt</li>
              <li>Bạn có thể upload/cập nhật hình ảnh sau khi gửi bài</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
