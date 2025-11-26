'use client';

import { CheckCircle2, Package, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RatingForm } from './RatingForm';
import { ContractStatus } from '@/lib/api/transactionApi';
import { checkUserRatedPost } from '@/lib/api/ratingApi';
import { useQuery } from '@tanstack/react-query';

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
  // Check if user has already rated this post
  const { data: ratingStatus, isLoading: isCheckingRating } = useQuery({
    queryKey: ['ratingStatus', postId],
    queryFn: () => checkUserRatedPost(postId),
    enabled: isBuyer && contractStatus === ContractStatus.SUCCESS,
  });

  const isContractSuccess = contractStatus === ContractStatus.SUCCESS;
  const hasAlreadyRated = ratingStatus?.hasRated === true;
  const showRatingForm = isBuyer && isContractSuccess && !hasAlreadyRated && !isCheckingRating;

  return (
    <>
      {/* Rating Form - Show above actions for successful buyer orders */}
      {showRatingForm && <RatingForm postId={postId} />}

      {/* Show rated message if already rated */}
      {isBuyer && isContractSuccess && hasAlreadyRated && (
        <Card className="border-none shadow-none bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle className="h-6 w-6" />
              <div>
                <p className="font-medium">Bạn đã đánh giá sản phẩm này</p>
                <p className="text-sm text-green-600">Cảm ơn bạn đã đánh giá!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              style={isBuyer ? { backgroundColor: '#2563eb' } : { backgroundColor: '#16a34a' }}
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
