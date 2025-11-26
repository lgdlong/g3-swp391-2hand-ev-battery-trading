'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface StatusSummaryCardsProps {
  counts: {
    pendingReviewCount: number;
    publishedCount: number;
    rejectedCount: number;
  };
}

export function StatusSummaryCards({ counts }: StatusSummaryCardsProps) {
  const { pendingReviewCount, publishedCount, rejectedCount } = counts;

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thống kê bài đăng</h2>
        <p className="text-gray-600">Tổng quan về trạng thái các bài đăng</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-yellow-700 mb-1">Chờ duyệt</h3>
                <div className="text-3xl font-bold text-yellow-800">{pendingReviewCount}</div>
                <p className="text-xs text-yellow-600 mt-1">Cần phê duyệt</p>
              </div>
              <div className="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center group-hover:bg-yellow-300 transition-colors">
                <Clock className="w-6 h-6 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-700 mb-1">Đã đăng</h3>
                <div className="text-3xl font-bold text-blue-800">{publishedCount}</div>
                <p className="text-xs text-blue-600 mt-1">Đang hiển thị</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center group-hover:bg-blue-300 transition-colors">
                <CheckCircle className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-red-700 mb-1">Từ chối</h3>
                <div className="text-3xl font-bold text-red-800">{rejectedCount}</div>
                <p className="text-xs text-red-600 mt-1">Không đạt yêu cầu</p>
              </div>
              <div className="w-12 h-12 bg-red-200 rounded-xl flex items-center justify-center group-hover:bg-red-300 transition-colors">
                <XCircle className="w-6 h-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
