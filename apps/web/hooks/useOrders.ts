import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  buyNow,
  sellerConfirm,
  completeOrder,
  cancelOrder,
  getMyOrders,
  getOrderById,
  checkBuyerOrderForPost,
  type BuyNowDto,
  type SellerConfirmDto,
  type Order,
  type OrderStatus,
  SellerAction,
} from '@/lib/api/ordersApi';

/**
 * Hook để lấy danh sách đơn hàng của tôi
 */
export function useMyOrders(role: 'buyer' | 'seller' | 'all' = 'all', status?: OrderStatus) {
  return useQuery({
    queryKey: ['orders', 'my', role, status],
    queryFn: () => getMyOrders(role, status),
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook để lấy đơn hàng theo role buyer
 */
export function useMyBuyerOrders(status?: OrderStatus) {
  return useMyOrders('buyer', status);
}

/**
 * Hook để lấy đơn hàng theo role seller
 */
export function useMySellerOrders(status?: OrderStatus) {
  return useMyOrders('seller', status);
}

/**
 * Hook để lấy chi tiết đơn hàng
 */
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
  });
}

/**
 * Hook để check buyer có order cho post không
 */
export function useBuyerOrderForPost(postId: string) {
  return useQuery({
    queryKey: ['orders', 'buyer-post', postId],
    queryFn: () => checkBuyerOrderForPost(postId),
    enabled: !!postId,
  });
}

/**
 * Hook để mua ngay
 */
export function useBuyNow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: BuyNowDto) => buyNow(dto),
    onSuccess: (order) => {
      toast.success(`Đặt mua thành công! Mã đơn: ${order.code}`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['post', order.postId] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Có lỗi xảy ra khi mua';
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook để seller xác nhận đơn hàng
 */
export function useSellerConfirm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, dto }: { orderId: string; dto: SellerConfirmDto }) =>
      sellerConfirm(orderId, dto),
    onSuccess: (order, variables) => {
      if (variables.dto.action === SellerAction.ACCEPT) {
        toast.success('Đã xác nhận đơn hàng! Vui lòng giao xe cho người mua.');
      } else {
        toast.info('Đã từ chối đơn hàng. Tiền đã được hoàn lại cho người mua.');
      }
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['post', order.postId] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Có lỗi xảy ra';
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook để buyer hoàn tất đơn hàng
 */
export function useCompleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => completeOrder(orderId),
    onSuccess: (order) => {
      toast.success('Xác nhận đã nhận xe thành công! Đơn hàng đã hoàn tất.');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['post', order.postId] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Có lỗi xảy ra';
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook để buyer hủy đơn hàng
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, note }: { orderId: string; note?: string }) =>
      cancelOrder(orderId, note),
    onSuccess: (order) => {
      toast.info('Đã hủy đơn hàng. Tiền đã được hoàn lại.');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['post', order.postId] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Có lỗi xảy ra';
      toast.error(errorMessage);
    },
  });
}
