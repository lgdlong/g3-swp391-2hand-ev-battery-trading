'use client';

import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ContractErrorStateProps {
  error: unknown;
}

export function ContractErrorState({ error }: ContractErrorStateProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Không tìm thấy hợp đồng</h2>
            <p className="text-gray-600 mb-4">
              {error
                ? 'Có lỗi xảy ra khi tải dữ liệu'
                : 'Hợp đồng không tồn tại hoặc bạn không có quyền xem'}
            </p>
            <Button onClick={() => router.back()}>Quay lại</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

