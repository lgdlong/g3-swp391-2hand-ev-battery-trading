export enum OrderStatus {
  WAITING_SELLER_CONFIRM = 'WAITING_SELLER_CONFIRM',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
/**
 *
  // Mới tạo, chưa thanh toán
  // Buyer đã thanh toán (tiền treo), chờ Seller xác nhận
  // Seller đã xác nhận, đang giao hàng
  // Buyer đã nhận hàng, tiền đã về ví Seller
  // Hủy (hoàn tiền cho Buyer)
 */
