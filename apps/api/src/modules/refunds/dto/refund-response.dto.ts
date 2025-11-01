// src/modules/refunds/dto/refund-response.dto.ts
export class RefundResponseDto {
  success!: boolean;
  dryRun!: boolean;
  orderCode!: string | null;
  paymentOrderId!: number | null;
  payerAccountId!: number;
  serviceTypeCode?: string;
  scenario!: string;
  policyRatePercent!: number;     // rate áp dụng
  refundableAmount!: number;      // số tiền sẽ/đã hoàn
  currency!: 'VND';
  notes?: string;

  // Nếu thực thi:
  walletTransactionId?: number;
  paymentOrderStatus?: string;   // REFUNDED | HELD | REJECTED
  refundedAt?: string;           // ISO timestamp
}
