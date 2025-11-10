'use client';

import { useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefundCase } from '@/types/refund';
import {
  useGetAllRefunds,
  useGetRefundCandidates,
  useManualRefundForPost,
} from '@/hooks/useRefund';
import { ResolveCaseDialog } from './resolve-case-dialog';
import { CasesTableCard } from './cases-table-card';
import { PendingRefundCandidatesCard } from './pending-refund-candidates-card';

export function CasesClient() {
  const { data: cases, isLoading, error, refetch } = useGetAllRefunds();
  const {
    data: candidates = [],
    isLoading: candidatesLoading,
    refetch: refetchCandidates,
  } = useGetRefundCandidates();
  const { mutate: manualRefund, isPending: isProcessing } = useManualRefundForPost();

  const [selectedCase, setSelectedCase] = useState<RefundCase | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleResolveCase = (refundCase: RefundCase) => {
    setSelectedCase(refundCase);
    setDialogOpen(true);
  };

  const handleManualRefund = (postId: string) => {
    if (confirm(`Bạn có chắc muốn hoàn tiền thủ công cho bài đăng ${postId}?`)) {
      manualRefund(postId, {
        onSuccess: () => {
          refetchCandidates();
          refetch();
        },
      });
    }
  };

  const allCases = cases || [];
  const stats = {
    total: allCases.length,
    pending: allCases.filter((c) => c.status === 'PENDING').length,
    refunded: allCases.filter((c) => c.status === 'REFUNDED').length,
    rejected: allCases.filter((c) => c.status === 'REJECTED').length,
    failed: allCases.filter((c) => c.status === 'FAILED').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="flex flex-wrap gap-4">
        <Card className="max-w-xs w-full flex-1">
          <CardHeader className="pb-3">
            <CardDescription>Tổng cộng</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="max-w-xs w-full flex-1">
          <CardHeader className="pb-3">
            <CardDescription>Chờ duyệt</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="max-w-xs w-full flex-1">
          <CardHeader className="pb-3">
            <CardDescription>Đã hoàn</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.refunded}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="max-w-xs w-full flex-1">
          <CardHeader className="pb-3">
            <CardDescription>Từ chối</CardDescription>
            <CardTitle className="text-3xl text-gray-600">{stats.rejected}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="max-w-xs w-full flex-1">
          <CardHeader className="pb-3">
            <CardDescription>Thất bại</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.failed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Cases Table Card */}
      <CasesTableCard
        cases={cases}
        isLoading={isLoading}
        error={error}
        onRefetch={refetch}
        onSelectCase={handleResolveCase}
      />

      {/* Pending Refund Candidates Card */}
      <PendingRefundCandidatesCard
        candidates={candidates}
        isLoading={candidatesLoading}
        isProcessing={isProcessing}
        onManualRefund={handleManualRefund}
        onRefetch={refetchCandidates}
      />

      <ResolveCaseDialog refundCase={selectedCase} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
