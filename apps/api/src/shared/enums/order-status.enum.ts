export enum OrderStatus {
  PENDING = 'PENDING', // Mới tạo, chưa thanh toán
  WAITING_SELLER_CONFIRM = 'WAITING_SELLER_CONFIRM', // Buyer đã thanh toán (tiền treo), chờ Seller xác nhận
  PROCESSING = 'PROCESSING', // Seller đã xác nhận, đang giao hàng
  COMPLETED = 'COMPLETED', // Buyer đã nhận hàng, tiền đã về ví Seller
  CANCELLED = 'CANCELLED', // Hủy (hoàn tiền cho Buyer)
  DISPUTE = 'DISPUTE', // Có tranh chấp/khiếu nại
}
