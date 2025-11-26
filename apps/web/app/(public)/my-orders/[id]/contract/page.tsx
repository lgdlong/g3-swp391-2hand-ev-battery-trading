'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '@/lib/api/ordersApi';
import { getContractByOrderId } from '@/lib/api/transactionApi';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Loader2, FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

// Import contract components from transactions
import { ContractHeader } from '@/app/(public)/transactions/contracts/[id]/_components/ContractHeader';
import { ContractActionsCard } from '@/app/(public)/transactions/contracts/[id]/_components/ContractActionsCard';
import { ContractStatusCard } from '@/app/(public)/transactions/contracts/[id]/_components/ContractStatusCard';
import { ContractParticipantsCard } from '@/app/(public)/transactions/contracts/[id]/_components/ContractParticipantsCard';
import { OrderInformation } from '@/app/(public)/transactions/contracts/[id]/_components/OrderInformation';
import { ContractConfirmationDialog } from '@/app/(public)/transactions/contracts/[id]/_components/ContractConfirmationDialog';
import { ContractLoadingState } from '@/app/(public)/transactions/contracts/[id]/_components/ContractLoadingState';
import { ContractStatus } from '@/lib/api/transactionApi';
import { getPostById } from '@/lib/api/postApi';
import { adaptPostDto } from '@/lib/adapters/post';
import { formatDate } from '@/app/(public)/transactions/contracts/[id]/_components/utils';

export default function OrderContractPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const orderId = params?.id as string;
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để xem hợp đồng');
      router.push('/login');
    }
  }, [isLoggedIn, authLoading, router]);

  // Fetch order details
  const {
    data: order,
    isLoading: orderLoading,
    error: orderError,
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId && isLoggedIn,
  });

  // Fetch contract by orderId
  const { data: contract, isLoading: contractLoading } = useQuery({
    queryKey: ['contract', 'by-order', orderId],
    queryFn: () => getContractByOrderId(orderId),
    enabled: !!orderId && isLoggedIn,
  });

  // Fetch post details for contract display
  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ['post', order?.postId],
    queryFn: () => getPostById(order!.postId),
    select: adaptPostDto,
    enabled: !!order?.postId,
  });

  // Show loading state
  if (authLoading || orderLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#048C73]" />
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  // Show error for order fetch
  if (orderError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Không tìm thấy đơn hàng</h2>
            <p className="text-gray-600 mb-4">
              Đơn hàng này không tồn tại hoặc bạn không có quyền xem.
            </p>
            <Button asChild>
              <Link href="/my-orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại đơn hàng
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading for contract
  if (contractLoading) {
    return <ContractLoadingState />;
  }

  // No contract found - show info card
  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Back button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/my-orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại đơn hàng
            </Link>
          </Button>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#048C73]" />
                Hợp đồng đơn hàng #{order?.code}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <AlertCircle className="h-10 w-10 text-yellow-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Hợp đồng chưa được tạo</h3>
                <p className="text-gray-600">
                  Hợp đồng sẽ được tạo tự động sau khi giao dịch hoàn tất.
                </p>
              </div>

              {order && (
                <div className="text-left bg-gray-50 rounded-lg p-4 space-y-2">
                  <p>
                    <span className="font-medium">Mã đơn:</span> {order.code}
                  </p>
                  <p>
                    <span className="font-medium">Sản phẩm:</span> {order.post?.title || 'N/A'}
                  </p>
                  <p>
                    <span className="font-medium">Giá trị:</span>{' '}
                    {new Intl.NumberFormat('vi-VN').format(Number.parseFloat(order.amount))} ₫
                  </p>
                  <p>
                    <span className="font-medium">Trạng thái:</span> {order.status}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Contract found - display full contract view
  const isBuyer = user?.id === contract.buyerId;
  const isSeller = user?.id === contract.sellerId;
  const canConfirmBuyer =
    isBuyer &&
    !contract.buyerConfirmedAt &&
    contract.status === ContractStatus.AWAITING_CONFIRMATION;
  const canConfirmSeller = isSeller && !contract.sellerConfirmedAt;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="container mx-auto px-4 py-4">
        <Button variant="ghost" asChild>
          <Link href="/my-orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại đơn hàng
          </Link>
        </Button>
      </div>

      <ContractHeader contract={contract} />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Action Cards */}
          <div className="lg:col-span-1 space-y-6">
            <ContractActionsCard
              isBuyer={isBuyer}
              canConfirmBuyer={canConfirmBuyer}
              canConfirmSeller={canConfirmSeller}
              onConfirmClick={() => setIsConfirmDialogOpen(true)}
              contractStatus={contract.status}
              postId={contract.listingId}
            />

            <ContractStatusCard contract={contract} />

            <ContractParticipantsCard contract={contract} />
          </div>

          {/* Right Column - Order Information */}
          <div className="lg:col-span-2 space-y-6">
            <OrderInformation
              post={post}
              isLoadingPost={isLoadingPost}
              contract={contract}
              formatDate={formatDate}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {user && (
        <ContractConfirmationDialog
          contract={contract}
          currentUserId={user.id}
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          onSuccess={() => {
            // Contract will be refetched automatically via query invalidation
          }}
        />
      )}
    </div>
  );
}
