'use client';

import { CheckCircle2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RatingForm } from './RatingForm';
import { ContractStatus } from '@/lib/api/transactionApi';

interface ContractActionsCardProps {
  isBuyer: boolean;
  canConfirmBuyer: boolean;
  canConfirmSeller: boolean;
  onConfirmClick: () => void;
  contractStatus: ContractStatus;
  postId: string;
}

export function ContractActionsCard({
  isBuyer,
  canConfirmBuyer,
  canConfirmSeller,
  onConfirmClick,
  contractStatus,
  postId,
}: ContractActionsCardProps) {
  const showRatingForm = isBuyer && contractStatus === ContractStatus.SUCCESS;

  return (
    <>
      {/* Rating Form - Show above actions for successful buyer orders */}
      {showRatingForm && <RatingForm postId={postId} />}

      <Card className="border-none shadow-none">
        <CardContent className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Hành động
            </CardTitle>
            <CardDescription className="mt-2">
              {isBuyer
                ? 'Xác nhận đã nhận hàng hoặc xem lại thông tin sản phẩm'
                : 'Xác nhận bạn đã giao hàng hoặc xem lại thông tin sản phẩm'}
            </CardDescription>
          </CardHeader>
          {(canConfirmBuyer || canConfirmSeller) && (
            <Button
              onClick={onConfirmClick}
              className="w-full"
              size="lg"
              variant="default"
              style={
                isBuyer ? { backgroundColor: '#2563eb' } : { backgroundColor: '#16a34a' }
              }
            >
              {isBuyer ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Xác nhận đã nhận hàng
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Xác nhận đã giao hàng
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </>
  );
}

