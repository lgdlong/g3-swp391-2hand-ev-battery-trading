'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { useMyBuyerOrders, useMySellerOrders } from '@/hooks/useOrders';
import { OrderStatus } from '@/lib/api/ordersApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ShoppingBag, Store } from 'lucide-react';
import { OrderCard } from './_components/OrderCard';

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isLoggedIn, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');

  // Redirect if not logged in
  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để xem đơn hàng của bạn');
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);

  // Fetch orders
  const { data: buyerOrders, isLoading: isLoadingBuyer } = useMyBuyerOrders();
  const { data: sellerOrders, isLoading: isLoadingSeller } = useMySellerOrders();

  // Group orders by status
  const groupByStatus = (orders: typeof buyerOrders) => {
    if (!orders) return { waiting: [], processing: [], completed: [], cancelled: [] };
    return {
      waiting: orders.filter((o) => o.status === OrderStatus.WAITING_SELLER_CONFIRM),
      processing: orders.filter((o) => o.status === OrderStatus.PROCESSING),
      completed: orders.filter((o) => o.status === OrderStatus.COMPLETED),
      cancelled: orders.filter(
        (o) =>
          o.status === OrderStatus.CANCELLED ||
          o.status === OrderStatus.DISPUTE ||
          o.status === OrderStatus.REFUNDED,
      ),
    };
  };

  const buyerGrouped = groupByStatus(buyerOrders);
  const sellerGrouped = groupByStatus(sellerOrders);

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
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Package className="h-8 w-8 text-[#048C73]" />
            Quản lý đơn hàng
          </h1>
          <p className="text-muted-foreground">Theo dõi và quản lý tất cả các đơn hàng của bạn</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'buyer' | 'seller')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger
              value="buyer"
              className="gap-2 font-semibold h-full data-[state=active]:bg-white"
            >
              <ShoppingBag className="h-4 w-4" />
              Đơn mua ({buyerOrders?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="seller"
              className="gap-2 font-semibold h-full data-[state=active]:bg-white"
            >
              <Store className="h-4 w-4" />
              Đơn bán ({sellerOrders?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* BUYER Tab */}
          <TabsContent value="buyer" className="space-y-6">
            {isLoadingBuyer ? (
              <LoadingState />
            ) : buyerOrders?.length === 0 ? (
              <EmptyState message="Bạn chưa có đơn mua nào" />
            ) : (
              <>
                {/* Waiting Section */}
                {buyerGrouped.waiting.length > 0 && (
                  <OrderSection
                    title="Chờ người bán xác nhận"
                    count={buyerGrouped.waiting.length}
                    color="yellow"
                  >
                    {buyerGrouped.waiting.map((order) => (
                      <OrderCard key={order.id} order={order} role="buyer" />
                    ))}
                  </OrderSection>
                )}

                {/* Processing Section */}
                {buyerGrouped.processing.length > 0 && (
                  <OrderSection
                    title="Đang giao dịch"
                    count={buyerGrouped.processing.length}
                    color="blue"
                  >
                    {buyerGrouped.processing.map((order) => (
                      <OrderCard key={order.id} order={order} role="buyer" />
                    ))}
                  </OrderSection>
                )}

                {/* Completed Section */}
                {buyerGrouped.completed.length > 0 && (
                  <OrderSection
                    title="Hoàn thành"
                    count={buyerGrouped.completed.length}
                    color="green"
                  >
                    {buyerGrouped.completed.map((order) => (
                      <OrderCard key={order.id} order={order} role="buyer" />
                    ))}
                  </OrderSection>
                )}

                {/* Cancelled Section */}
                {buyerGrouped.cancelled.length > 0 && (
                  <OrderSection
                    title="Đã hủy / Hoàn tiền"
                    count={buyerGrouped.cancelled.length}
                    color="gray"
                  >
                    {buyerGrouped.cancelled.map((order) => (
                      <OrderCard key={order.id} order={order} role="buyer" />
                    ))}
                  </OrderSection>
                )}
              </>
            )}
          </TabsContent>

          {/* SELLER Tab */}
          <TabsContent value="seller" className="space-y-6">
            {isLoadingSeller ? (
              <LoadingState />
            ) : sellerOrders?.length === 0 ? (
              <EmptyState message="Bạn chưa có đơn bán nào" />
            ) : (
              <>
                {/* Waiting Section */}
                {sellerGrouped.waiting.length > 0 && (
                  <OrderSection
                    title="Chờ xác nhận"
                    count={sellerGrouped.waiting.length}
                    color="yellow"
                    highlight
                  >
                    {sellerGrouped.waiting.map((order) => (
                      <OrderCard key={order.id} order={order} role="seller" />
                    ))}
                  </OrderSection>
                )}

                {/* Processing Section */}
                {sellerGrouped.processing.length > 0 && (
                  <OrderSection
                    title="Đang giao dịch"
                    count={sellerGrouped.processing.length}
                    color="blue"
                  >
                    {sellerGrouped.processing.map((order) => (
                      <OrderCard key={order.id} order={order} role="seller" />
                    ))}
                  </OrderSection>
                )}

                {/* Completed Section */}
                {sellerGrouped.completed.length > 0 && (
                  <OrderSection
                    title="Hoàn thành"
                    count={sellerGrouped.completed.length}
                    color="green"
                  >
                    {sellerGrouped.completed.map((order) => (
                      <OrderCard key={order.id} order={order} role="seller" />
                    ))}
                  </OrderSection>
                )}

                {/* Cancelled Section */}
                {sellerGrouped.cancelled.length > 0 && (
                  <OrderSection
                    title="Đã hủy / Hoàn tiền"
                    count={sellerGrouped.cancelled.length}
                    color="gray"
                  >
                    {sellerGrouped.cancelled.map((order) => (
                      <OrderCard key={order.id} order={order} role="seller" />
                    ))}
                  </OrderSection>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Order Section Component
function OrderSection({
  title,
  count,
  color,
  highlight,
  children,
}: {
  title: string;
  count: number;
  color: 'yellow' | 'blue' | 'green' | 'gray';
  highlight?: boolean;
  children: React.ReactNode;
}) {
  const colorClasses = {
    yellow: 'border-yellow-200 bg-yellow-50',
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    gray: 'border-gray-200 bg-gray-50',
  };

  const badgeColors = {
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    gray: 'bg-gray-500',
  };

  return (
    <div className={`rounded-xl border-2 p-4 ${highlight ? colorClasses[color] : ''}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className={`${badgeColors[color]} text-white text-xs px-2 py-1 rounded-full`}>
          {count}
        </span>
        <h2 className="font-semibold text-lg">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// Loading State
function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-40" />
      ))}
    </div>
  );
}

// Empty State
function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
