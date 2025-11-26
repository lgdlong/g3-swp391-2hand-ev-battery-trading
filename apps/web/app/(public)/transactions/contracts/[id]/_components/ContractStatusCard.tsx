'use client';

import { CheckCircle2, Clock, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getStatusConfig, formatDate } from './utils';
import type { Contract } from '@/lib/api/transactionApi';

interface ContractStatusCardProps {
  contract: Contract;
}

export function ContractStatusCard({ contract }: ContractStatusCardProps) {
  const statusConfig = getStatusConfig(contract.status);

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Trạng thái hợp đồng
          </CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Trạng thái:</span>
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
          </div>
          {contract.isExternalTransaction && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Giao dịch ngoài:</span>
              <Badge className="bg-orange-100 text-orange-800">Có</Badge>
            </div>
          )}
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Người mua xác nhận:</span>
              <span
                className={
                  contract.buyerConfirmedAt ? 'text-green-600 font-medium' : 'text-gray-400'
                }
              >
                {contract.buyerConfirmedAt ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Đã xác nhận
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Chờ xác nhận
                  </span>
                )}
              </span>
            </div>
            {contract.buyerConfirmedAt && (
              <p className="text-xs text-gray-500">
                {formatDate(contract.buyerConfirmedAt)}
              </p>
            )}
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Người bán xác nhận:</span>
              <span
                className={
                  contract.sellerConfirmedAt
                    ? 'text-green-600 font-medium'
                    : 'text-gray-400'
                }
              >
                {contract.sellerConfirmedAt ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Đã xác nhận
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Chờ xác nhận
                  </span>
                )}
              </span>
            </div>
            {contract.sellerConfirmedAt && (
              <p className="text-xs text-gray-500">
                {formatDate(contract.sellerConfirmedAt)}
              </p>
            )}
          </div>
          {contract.confirmedAt && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Cả hai đã xác nhận:</span>
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    {formatDate(contract.confirmedAt)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

