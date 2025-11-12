export enum RefundScenario {
  TRANSACTION_SUCCESS = 'TRANSACTION_SUCCESS', // Giao dịch thành công (SOLD): 0% refund, 100% fee
  FRAUD_CONFIRMED = 'FRAUD_CONFIRMED', // Gian lận đã xác nhận: 0% refund (REJECTED)
  FRAUD_SUSPECTED = 'FRAUD_SUSPECTED', // Gian lận nghi ngờ: 0% (PENDING admin)
  CANCEL_EARLY = 'CANCEL_EARLY', // Hủy sớm < 7 ngày: 100%
  CANCEL_LATE = 'CANCEL_LATE', // Hủy trễ/Bán chui: 70%
  EXPIRED = 'EXPIRED', // Hết hạn: 50%
}
