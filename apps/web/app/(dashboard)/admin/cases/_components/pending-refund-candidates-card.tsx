'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw } from 'lucide-react';
import { RefundCandidatePost } from '@/types/refund';

interface PendingRefundCandidatesCardProps {
  candidates: RefundCandidatePost[];
  isLoading: boolean;
  isProcessing: boolean;
  onManualRefund: (postId: string) => void;
  onRefetch: () => void;
}

export function PendingRefundCandidatesCard({
  candidates,
  isLoading,
  isProcessing,
  onManualRefund,
  onRefetch,
}: PendingRefundCandidatesCardProps) {
  const calculateDaysSinceReviewed = (reviewedAt: string): number => {
    const now = new Date();
    const reviewed = new Date(reviewedAt);
    return Math.floor((now.getTime() - reviewed.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getRefundScenario = (status: string, daysSinceReviewed: number) => {
    if (status === 'ARCHIVED') {
      return daysSinceReviewed < 7
        ? { scenario: 'CANCEL_EARLY', rate: 100, color: 'bg-green-100 text-green-800' }
        : { scenario: 'CANCEL_LATE', rate: 70, color: 'bg-yellow-100 text-yellow-800' };
    }
    if (status === 'PUBLISHED' && daysSinceReviewed >= 30) {
      return { scenario: 'EXPIRED', rate: 50, color: 'bg-orange-100 text-orange-800' };
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Posts Đang Chờ Hoàn Tiền
        </CardTitle>
        <CardDescription>
          Danh sách các post đã đủ điều kiện refund nhưng chưa được cron job xử lý. Admin có thể
          manual refund nếu cần gấp.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Đang tải...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Không có post nào đang chờ refund</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{candidates.length} posts đang chờ xử lý</span>
              <Button variant="outline" size="sm" onClick={() => onRefetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {candidates.slice(0, 10).map((post) => {
                const daysSinceReviewed = calculateDaysSinceReviewed(post.reviewedAt);
                const scenario = getRefundScenario(post.status, daysSinceReviewed);

                return (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{post.title}</span>
                        {scenario && (
                          <Badge className={scenario.color}>
                            {scenario.scenario} ({scenario.rate}%)
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Post #{post.id} • {post.seller.email} • {daysSinceReviewed} ngày trước
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onManualRefund(post.id)}
                      disabled={isProcessing}
                      className="ml-3"
                    >
                      {isProcessing ? 'Processing...' : 'Manual Refund'}
                    </Button>
                  </div>
                );
              })}
              {candidates.length > 10 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  Và {candidates.length - 10} posts khác...
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
