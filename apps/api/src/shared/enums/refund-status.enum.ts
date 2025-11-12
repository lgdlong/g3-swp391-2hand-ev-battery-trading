export enum RefundStatus {
  PENDING = 'PENDING', // Chờ xử lý (có thể auto hoặc chờ admin)
  REFUNDED = 'REFUNDED', // Đã hoàn tiền thành công
  FAILED = 'FAILED', // Hoàn tiền thất bại
  REJECTED = 'REJECTED', // Admin từ chối hoàn tiền
}
