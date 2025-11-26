import { useQuery } from '@tanstack/react-query';
import { getMyOrders, OrderStatus, type Order } from '@/lib/api/ordersApi';
import { useAuth } from '@/lib/auth-context';

/**
 * Hook to get post IDs that have orders with specific statuses
 * Returns a Set of post IDs that should be filtered out
 */
export function usePostOrdersFilter(
  excludeStatuses: OrderStatus[] = [
    OrderStatus.PROCESSING,
    OrderStatus.COMPLETED,
    OrderStatus.DISPUTE,
  ],
): Set<string> {
  const { isLoggedIn } = useAuth();

  // Fetch all orders (as seller and buyer) to get comprehensive list
  const { data: allOrders = [] } = useQuery<Order[]>({
    queryKey: ['orders', 'all', 'for-filter'],
    queryFn: async () => {
      // Fetch orders as both buyer and seller to get all relevant orders
      const [buyerOrders, sellerOrders] = await Promise.all([
        getMyOrders('buyer').catch(() => []),
        getMyOrders('seller').catch(() => []),
      ]);

      // Combine and deduplicate
      const allOrdersMap = new Map<string, Order>();
      [...buyerOrders, ...sellerOrders].forEach((order) => {
        if (!allOrdersMap.has(order.id)) {
          allOrdersMap.set(order.id, order);
        }
      });

      return Array.from(allOrdersMap.values());
    },
    enabled: isLoggedIn, // Only fetch if user is logged in
    staleTime: 30 * 1000, // 30 seconds
    retry: false,
  });

  // Create a Set of post IDs that have orders with the specified statuses
  const excludedPostIds = new Set<string>();

  if (allOrders.length > 0) {
    allOrders.forEach((order) => {
      if (excludeStatuses.includes(order.status) && order.postId) {
        excludedPostIds.add(order.postId.toString());
      }
    });
  }

  return excludedPostIds;
}

/**
 * Utility function to filter posts that have orders with specific statuses
 */
export function filterPostsByOrderStatus<T extends { id: string }>(
  posts: T[],
  excludedPostIds: Set<string>,
): T[] {
  if (excludedPostIds.size === 0) {
    return posts; // No filtering needed if no excluded posts
  }

  return posts.filter((post) => !excludedPostIds.has(post.id.toString()));
}
