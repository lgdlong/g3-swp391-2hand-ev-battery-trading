'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { getBuyerContracts, ContractStatus } from '@/lib/api/transactionApi';
import { getMyPosts } from '@/lib/api/postApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Package, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { ContractCard } from './_components/ContractCard';
import { SoldPostCard } from './_components/SoldPostCard';

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isLoggedIn, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'delivering' | 'delivered' | 'sold'>('delivering');

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

  // Fetch only buyer contracts (orders that buyer purchased)
  const { data: buyerContracts, isLoading: isLoadingBuyer } = useQuery({
    queryKey: ['buyerContracts'],
    queryFn: () => getBuyerContracts(),
    enabled: isLoggedIn && !!user,
    retry: 1,
    refetchInterval: 5000, // Refetch every 5 seconds to catch new contracts
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Fetch sold posts (posts with status SOLD)
  const { data: soldPosts, isLoading: isLoadingSold } = useQuery({
    queryKey: ['myPosts', 'SOLD'],
    queryFn: () => getMyPosts({ status: 'SOLD', order: 'DESC', sort: 'createdAt' }),
    enabled: isLoggedIn && !!user,
    retry: 1,
    refetchInterval: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Filter contracts by status
  // "Đang giao": Buyer hasn't confirmed receipt yet (AWAITING_CONFIRMATION)
  // "Đã giao": Buyer has confirmed receipt (SUCCESS)
  const deliveringContracts = (buyerContracts || []).filter(
    (contract) => contract.status === ContractStatus.AWAITING_CONFIRMATION,
  );

  const deliveredContracts = (buyerContracts || []).filter(
    (contract) => contract.status === ContractStatus.SUCCESS,
  );

  const isLoading = isLoadingBuyer || isLoadingSold;

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

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'delivering' | 'delivered' | 'sold')} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="delivering">
              Đang giao ({deliveringContracts.length})
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Đã giao ({deliveredContracts.length})
            </TabsTrigger>
            <TabsTrigger value="sold">
              Đã bán ({soldPosts?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="delivering" className="mt-6">
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
            ) : deliveringContracts.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có đơn hàng đang giao</h3>
                  <p className="text-muted-foreground mb-6">
                    Các đơn hàng đang được giao sẽ xuất hiện ở đây sau khi người bán chốt đơn.
                  </p>
                  <Button asChild>
                    <Link href="/chat">Đi đến Chat</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {deliveringContracts.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="delivered" className="mt-6">
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
            ) : deliveredContracts.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có đơn hàng đã giao</h3>
                  <p className="text-muted-foreground">
                    Các đơn hàng đã hoàn thành sẽ xuất hiện ở đây sau khi bạn xác nhận đã nhận hàng.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {deliveredContracts.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sold" className="mt-6">
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
            ) : (soldPosts?.length || 0) === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có sản phẩm đã bán</h3>
                  <p className="text-muted-foreground">
                    Các sản phẩm đã bán sẽ xuất hiện ở đây sau khi bạn đánh dấu "Đã bán" trong Quản lý tin đăng.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {soldPosts?.map((post) => (
                  <SoldPostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

