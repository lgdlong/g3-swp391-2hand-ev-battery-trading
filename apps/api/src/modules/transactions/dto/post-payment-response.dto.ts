import { ApiProperty } from '@nestjs/swagger';

export class PostPaymentResponseDto {
  @ApiProperty({
    description: 'ID of the post being paid for',
    example: '123',
  })
  postId!: string;

  @ApiProperty({
    description: 'ID of the account making the payment',
    example: 1,
  })
  accountId!: number;

  @ApiProperty({
    description: 'Amount paid for the post',
    example: '50000.00',
  })
  amountPaid!: string;

  @ApiProperty({
    description: 'ID of the wallet transaction record',
    example: 456,
  })
  walletTransactionId!: number;

  @ApiProperty({
    description: 'Payment creation date',
    example: '2023-10-01T10:00:00.000Z',
  })
  createdAt!: Date;
}
