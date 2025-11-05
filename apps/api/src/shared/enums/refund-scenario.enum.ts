export enum RefundScenario {
  CANCEL_EARLY = 'CANCEL_EARLY',       // Hủy sớm < 7 ngày: 100%
  CANCEL_LATE = 'CANCEL_LATE',         // Hủy trễ 7-30 ngày: 70%
  EXPIRED = 'EXPIRED',                 // Hết hạn > 30 ngày: 50%
  FRAUD_SUSPECTED = 'FRAUD_SUSPECTED', // Gian lận: 0% (REJECT)
}
