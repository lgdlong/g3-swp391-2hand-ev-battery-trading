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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, Package } from 'lucide-react';
import Link from 'next/link';
import { ContractCard } from './_components/ContractCard';

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isLoggedIn, loading } = useAuth();
  const [orderTypeFilter, setOrderTypeFilter] = useState<'buy' | 'sell'>('buy');
  const [activeTab, setActiveTab] = useState<
    | 'buy-awaiting'
    | 'buy-success'
    | 'buy-forfeited'
    | 'buy-pending-refund'
    | 'sell-awaiting'
    | 'sell-success'
    | 'sell-forfeited'
    | 'sell-pending-refund'
  >('buy-awaiting');

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

  // Filter buyer contracts (Đơn mua) by status
  const buyAwaitingContracts = (buyerContracts || []).filter(
    (contract) => contract.status === ContractStatus.AWAITING_CONFIRMATION,
  );
  const buySuccessContracts = (buyerContracts || []).filter(
    (contract) => contract.status === ContractStatus.SUCCESS,
  );
  const buyForfeitedContracts = (buyerContracts || []).filter(
    (contract) => contract.status === ContractStatus.FORFEITED_EXTERNAL,
  );
  const buyPendingRefundContracts = (buyerContracts || []).filter(
    (contract) => contract.status === ContractStatus.PENDING_REFUND,
  );

  // Filter seller contracts (Đơn bán) by status
  const sellAwaitingContracts = (sellerContracts || []).filter(
    (contract) => contract.status === ContractStatus.AWAITING_CONFIRMATION,
  );
  const sellSuccessContracts = (sellerContracts || []).filter(
    (contract) => contract.status === ContractStatus.SUCCESS,
  );
  const sellForfeitedContracts = (sellerContracts || []).filter(
    (contract) => contract.status === ContractStatus.FORFEITED_EXTERNAL,
  );
  const sellPendingRefundContracts = (sellerContracts || []).filter(
    (contract) => contract.status === ContractStatus.PENDING_REFUND,
  );

  const isLoading = isLoadingBuyer || isLoadingSeller;

  // Update active tab when filter changes
  useEffect(() => {
    if (orderTypeFilter === 'buy' && !activeTab.startsWith('buy-')) {
      setActiveTab('buy-awaiting');
    } else if (orderTypeFilter === 'sell' && !activeTab.startsWith('sell-')) {
      setActiveTab('sell-awaiting');
    }
  }, [orderTypeFilter, activeTab]);

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
          <p className="text-muted-foreground mb-4">
            Theo dõi và quản lý tất cả các đơn hàng của bạn
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Lọc theo:</span>
            <Select value={orderTypeFilter} onValueChange={(v) => setOrderTypeFilter(v as typeof orderTypeFilter)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chọn loại đơn hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Đơn mua</SelectItem>
                <SelectItem value="sell">Đơn bán</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            {orderTypeFilter === 'buy' && (
              <>
                <TabsTrigger value="buy-awaiting">
                  Đang chờ xác nhận ({buyAwaitingContracts.length})
                </TabsTrigger>
                <TabsTrigger value="buy-success">
                  Thành công ({buySuccessContracts.length})
                </TabsTrigger>
                <TabsTrigger value="buy-forfeited">
                  Đã hủy ({buyForfeitedContracts.length})
                </TabsTrigger>
                <TabsTrigger value="buy-pending-refund">
                  Chờ hoàn tiền ({buyPendingRefundContracts.length})
                </TabsTrigger>
              </>
            )}
            {orderTypeFilter === 'sell' && (
              <>
                <TabsTrigger value="sell-awaiting">
                  Đang chờ xác nhận ({sellAwaitingContracts.length})
                </TabsTrigger>
                <TabsTrigger value="sell-success">
                  Thành công ({sellSuccessContracts.length})
                </TabsTrigger>
                <TabsTrigger value="sell-forfeited">
                  Đã hủy ({sellForfeitedContracts.length})
                </TabsTrigger>
                <TabsTrigger value="sell-pending-refund">
                  Chờ hoàn tiền ({sellPendingRefundContracts.length})
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Đơn mua - Đang chờ xác nhận */}
          <TabsContent value="buy-awaiting" className="mt-6">
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
            ) : buyAwaitingContracts.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chưa có đơn mua đang chờ xác nhận
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Các đơn hàng bạn mua đang chờ xác nhận sẽ xuất hiện ở đây.
                  </p>
                  <Button asChild>
                    <Link href="/chat">Đi đến Chat</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {buyAwaitingContracts.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Đơn mua - Thành công */}
          <TabsContent value="buy-success" className="mt-6">
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
            ) : buySuccessContracts.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chưa có đơn mua thành công
                  </h3>
                  <p className="text-muted-foreground">
                    Các đơn hàng bạn mua đã hoàn thành thành công sẽ xuất hiện ở đây.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {buySuccessContracts.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Đơn mua - Đã hủy */}
          <TabsContent value="buy-forfeited" className="mt-6">
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
            ) : buyForfeitedContracts.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chưa có đơn mua đã hủy
                  </h3>
                  <p className="text-muted-foreground">
                    Các đơn hàng bạn mua đã bị hủy sẽ xuất hiện ở đây.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {buyForfeitedContracts.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Đơn mua - Chờ hoàn tiền */}
          <TabsContent value="buy-pending-refund" className="mt-6">
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
            ) : buyPendingRefundContracts.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chưa có đơn mua chờ hoàn tiền
                  </h3>
                  <p className="text-muted-foreground">
                    Các đơn hàng bạn mua đang chờ hoàn tiền sẽ xuất hiện ở đây.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {buyPendingRefundContracts.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Đơn bán - Đang chờ xác nhận */}
          <TabsContent value="sell-awaiting" className="mt-6">
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
            ) : sellAwaitingContracts.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chưa có đơn bán đang chờ xác nhận
                  </h3>
                  <p className="text-muted-foreground">
                    Các đơn hàng bạn bán đang chờ người mua xác nhận sẽ xuất hiện ở đây.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sellAwaitingContracts.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Đơn bán - Thành công */}
          <TabsContent value="sell-success" className="mt-6">
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
            ) : sellSuccessContracts.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chưa có đơn bán thành công
                  </h3>
                  <p className="text-muted-foreground">
                    Các đơn hàng bạn bán đã hoàn thành thành công sẽ xuất hiện ở đây.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sellSuccessContracts.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Đơn bán - Đã hủy */}
          <TabsContent value="sell-forfeited" className="mt-6">
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
            ) : sellForfeitedContracts.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chưa có đơn bán đã hủy
                  </h3>
                  <p className="text-muted-foreground">
                    Các đơn hàng bạn bán đã bị hủy sẽ xuất hiện ở đây.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sellForfeitedContracts.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Đơn bán - Chờ hoàn tiền */}
          <TabsContent value="sell-pending-refund" className="mt-6">
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
            ) : sellPendingRefundContracts.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chưa có đơn bán chờ hoàn tiền
                  </h3>
                  <p className="text-muted-foreground">
                    Các đơn hàng bạn bán đang chờ hoàn tiền sẽ xuất hiện ở đây.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sellPendingRefundContracts.map((contract) => (
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
