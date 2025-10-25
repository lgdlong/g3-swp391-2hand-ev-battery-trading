import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayosTransactionInfo } from './transaction-info.response.dto';

export class PayosPaymentInfo {
  @ApiProperty({
    description: 'Payment ID',
    example: '31813885cc3a4cbe8b7d4ccb0ff93411',
  })
  id!: string;

  @ApiProperty({
    description: 'Order code',
    example: 2,
  })
  orderCode!: number;

  @ApiProperty({
    description: 'Payment amount',
    example: 2000,
  })
  amount!: number;

  @ApiProperty({
    description: 'Amount paid by customer',
    example: 2000,
  })
  amountPaid!: number;

  @ApiProperty({
    description: 'Amount remaining to be paid',
    example: 0,
  })
  amountRemaining!: number;

  @ApiProperty({
    description: 'Payment status',
    example: 'PAID',
    enum: ['PENDING', 'PROCESSING', 'PAID', 'CANCELLED'],
  })
  status!: string;

  @ApiProperty({
    description: 'Creation date and time',
    example: '2025-10-21T15:00:56+07:00',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'List of transactions for this payment',
    type: [PayosTransactionInfo],
  })
  transactions!: PayosTransactionInfo[];

  @ApiPropertyOptional({
    description: 'Cancellation date (if cancelled)',
    example: null,
  })
  canceledAt!: string | null;

  @ApiPropertyOptional({
    description: 'Cancellation reason (if cancelled)',
    example: null,
  })
  cancellationReason!: string | null;
}
