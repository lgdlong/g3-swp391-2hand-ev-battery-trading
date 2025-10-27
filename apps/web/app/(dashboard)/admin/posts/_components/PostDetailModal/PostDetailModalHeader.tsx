import { Button } from '@/components/ui/button';
import { X, Car } from 'lucide-react';

interface PostDetailModalHeaderProps {
  onClose: () => void;
}

export function PostDetailModalHeader({ onClose }: PostDetailModalHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <Car className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chi tiết bài đăng</h2>
          <p className="text-sm text-gray-600">Thông tin chi tiết về sản phẩm</p>
        </div>
      </div>
      <Button
        onClick={onClose}
        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  );
}
