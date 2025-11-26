import { api } from '@/lib/axios';
import { getAuthHeaders } from '../auth';
import { Post, PostImage } from '@/types/post';

// Order Status enum (khớp với backend)
export enum OrderStatus {
  PENDING = 'PENDING',
  WAITING_SELLER_CONFIRM = 'WAITING_SELLER_CONFIRM',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

// Seller action enum
export enum SellerAction {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
}

// Order types
export interface OrderAccount {
  id: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
}

export interface OrderPost {
  id: string;
  title: string;
  priceVnd: string;
  postType: string;
  images: PostImage[];
}

export interface Order {
  id: string;
  code: string;
  buyerId: number;
  sellerId: number;
  postId: string;
  amount: string;
  status: OrderStatus;
  note: string | null;
  commissionFee: string | null;
  sellerReceiveAmount: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  buyer?: OrderAccount;
  seller?: OrderAccount;
  post?: Post;
}

// DTOs
export interface BuyNowDto {
  postId: string;
  note?: string;
}

export interface SellerConfirmDto {
  action: SellerAction;
  note?: string;
}

export interface CancelOrderDto {
  note?: string;
}

/**
 * Mua ngay - Buyer đặt mua, trừ tiền BUY_HOLD, lock post
 */
export async function buyNow(dto: BuyNowDto): Promise<Order> {
  const { data } = await api.post<Order>('/orders/buy-now', dto, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Seller xác nhận đơn hàng (ACCEPT/REJECT)
 */
export async function sellerConfirm(orderId: string, dto: SellerConfirmDto): Promise<Order> {
  const { data } = await api.put<Order>(`/orders/${orderId}/confirm`, dto, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Buyer hoàn tất đơn hàng - xác nhận đã nhận hàng
 */
export async function completeOrder(orderId: string): Promise<Order> {
  const { data } = await api.put<Order>(
    `/orders/${orderId}/complete`,
    {},
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

/**
 * Buyer hủy đơn hàng
 */
export async function cancelOrder(orderId: string, note?: string): Promise<Order> {
  const { data } = await api.put<Order>(
    `/orders/${orderId}/cancel`,
    { note },
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

/**
 * Lấy đơn hàng của tôi
 */
export async function getMyOrders(
  role: 'buyer' | 'seller' | 'all' = 'all',
  status?: OrderStatus,
): Promise<Order[]> {
  const params = new URLSearchParams();
  params.append('role', role);
  if (status) {
    params.append('status', status);
  }

  const { data } = await api.get<Order[]>(`/orders/my?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Lấy chi tiết đơn hàng
 */
export async function getOrderById(orderId: string): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/${orderId}`, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Lấy đơn hàng theo code
 */
export async function getOrderByCode(code: string): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/code/${code}`, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Kiểm tra xem buyer có order đang active cho post này không
 */
export async function checkBuyerOrderForPost(postId: string): Promise<Order | null> {
  try {
    const orders = await getMyOrders('buyer');
    const activeOrder = orders.find(
      (order) =>
        order.postId === postId &&
        [
          OrderStatus.WAITING_SELLER_CONFIRM,
          OrderStatus.PROCESSING,
          OrderStatus.COMPLETED,
        ].includes(order.status),
    );
    return activeOrder || null;
  } catch {
    return null;
  }
}

/**
 * [Admin] Lấy tất cả đơn hàng
 */
export async function getAllOrders(status?: OrderStatus): Promise<Order[]> {
  const params = new URLSearchParams();
  if (status) {
    params.append('status', status);
  }

  const { data } = await api.get<Order[]>(`/orders?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * [Admin] Lấy thống kê đơn hàng
 */
export interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  processingOrders: number;
  waitingConfirmOrders: number;
  gmv: string; // Gross Merchandise Value - Tổng giá trị giao dịch thành công
  totalEscrow: string; // Tiền đang tạm giữ (WAITING_SELLER_CONFIRM + PROCESSING)
  totalCommission: string; // Tổng hoa hồng thu được
}

export async function getOrderStats(): Promise<OrderStats> {
  const orders = await getAllOrders();

  const completedOrders = orders.filter((o) => o.status === OrderStatus.COMPLETED);
  const cancelledOrders = orders.filter((o) => o.status === OrderStatus.CANCELLED);
  const processingOrders = orders.filter((o) => o.status === OrderStatus.PROCESSING);
  const waitingConfirmOrders = orders.filter(
    (o) => o.status === OrderStatus.WAITING_SELLER_CONFIRM,
  );

  // GMV = Tổng giá trị đơn hàng thành công
  const gmv = completedOrders.reduce((sum, o) => sum + Number.parseFloat(o.amount || '0'), 0);

  // Escrow = Tiền đang tạm giữ (orders đang WAITING_SELLER_CONFIRM hoặc PROCESSING)
  const escrowOrders = [...waitingConfirmOrders, ...processingOrders];
  const totalEscrow = escrowOrders.reduce((sum, o) => sum + Number.parseFloat(o.amount || '0'), 0);

  // Tổng hoa hồng từ đơn hoàn thành
  const totalCommission = completedOrders.reduce(
    (sum, o) => sum + Number.parseFloat(o.commissionFee || '0'),
    0,
  );

  return {
    totalOrders: orders.length,
    completedOrders: completedOrders.length,
    cancelledOrders: cancelledOrders.length,
    processingOrders: processingOrders.length,
    waitingConfirmOrders: waitingConfirmOrders.length,
    gmv: gmv.toString(),
    totalEscrow: totalEscrow.toString(),
    totalCommission: totalCommission.toString(),
  };
}
