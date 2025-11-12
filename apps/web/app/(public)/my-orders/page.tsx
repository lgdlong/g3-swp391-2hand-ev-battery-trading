'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { getBuyerContracts, getSellerContracts, ContractStatus } from '@/lib/api/transactionApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Package } from 'lucide-react';
import Link from 'next/link';
import { ContractCard } from './_components/ContractCard';

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isLoggedIn, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'buy-pending' | 'buy-completed' | 'sell-pending' | 'sell-completed'
  >('buy-pending');

  // Redirect if not logged in
  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để xem đơn hàng của bạn');
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);

  // Fetch buyer contracts (đơn mua)
  const { data: buyerContracts, isLoading: isLoadingBuyer } = useQuery({
    queryKey: ['buyerContracts'],
    queryFn: () => getBuyerContracts(),
    enabled: isLoggedIn && !!user,
    retry: 1,
    refetchInterval: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Fetch seller contracts (đơn bán)
  const { data: sellerContracts, isLoading: isLoadingSeller } = useQuery({
    queryKey: ['sellerContracts'],
    queryFn: () => getSellerContracts(),
    enabled: isLoggedIn && !!user,
    retry: 1,
    refetchInterval: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Filter buyer contracts (Đơn mua)
  const buyPendingContracts = (buyerContracts || []).filter(
    (contract) => contract.status === ContractStatus.AWAITING_CONFIRMATION,
  );
  const buyCompletedContracts = (buyerContracts || []).filter(
    (contract) => contract.status === ContractStatus.SUCCESS,
  );

  // Filter seller contracts (Đơn bán)
  const sellPendingContracts = (sellerContracts || []).filter(
    (contract) => contract.status === ContractStatus.AWAITING_CONFIRMATION,
  );
  const sellCompletedContracts = (sellerContracts || []).filter(
    (contract) => contract.status === ContractStatus.SUCCESS,
  );

  const isLoading = isLoadingBuyer || isLoadingSeller;

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang kiểm tra trạng thái đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background md:p-8">
      <div className="mx-auto max-w-6xl p-6 bg-white rounded-2xl shadow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground">Theo dõi và quản lý tất cả các đơn hàng của bạn</p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="buy-pending">
              Đơn mua - Đang nhận ({buyPendingContracts.length})
            </TabsTrigger>
            <TabsTrigger value="buy-completed">
              Đơn mua - Hoàn thành ({buyCompletedContracts.length})
            </TabsTrigger>
            <TabsTrigger value="sell-pending">
              Đơn bán - Đang giao ({sellPendingContracts.length})
            </TabsTrigger>
            <TabsTrigger value="sell-completed">
              Đơn bán - Hoàn thành ({sellCompletedContracts.length})
            </TabsTrigger>
          </TabsList>

          {/* Đơn mua - Đang nhận hàng */}
          <TabsContent value="buy-pending" className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="shadow-lg">
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-1/3 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : buyPendingContracts.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chưa có đơn mua đang nhận
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Các đơn hàng bạn mua sẽ xuất hiện ở đây sau khi người bán chốt giao dịch.
                  </p>
                  <Button asChild>
                    <Link href="/chat">Đi đến Chat</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {buyPendingContracts.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Đơn mua - Đã hoàn thành */}
          <TabsContent value="buy-completed" className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="shadow-lg">
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-1/3 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : buyCompletedContracts.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chưa có đơn mua hoàn thành
                  </h3>
                  <p className="text-muted-foreground">
                    Các đơn hàng bạn mua đã hoàn thành sẽ xuất hiện ở đây.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {buyCompletedContracts.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Đơn bán - Đang giao */}
          <TabsContent value="sell-pending" className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="shadow-lg">
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-1/3 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sellPendingContracts.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chưa có đơn bán đang giao
                  </h3>
                  <p className="text-muted-foreground">
                    Các đơn hàng bạn bán đang chờ người mua xác nhận sẽ xuất hiện ở đây.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sellPendingContracts.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Đơn bán - Đã hoàn thành */}
          <TabsContent value="sell-completed" className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="shadow-lg">
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-1/3 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sellCompletedContracts.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chưa có đơn bán hoàn thành
                  </h3>
                  <p className="text-muted-foreground">
                    Các đơn hàng bạn bán đã hoàn thành sẽ xuất hiện ở đây.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sellCompletedContracts.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
