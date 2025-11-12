import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive } from 'class-validator';

export class RecordPostDepositDto {
  @ApiProperty({
    description: 'Post ID',
    example: '123',
  })
  @IsString()
  postId!: string;

  @ApiProperty({
    description: 'Account ID của user trả deposit',
    example: 156,
  })
  @IsNumber()
  @IsPositive()
  accountId!: number;

  @ApiProperty({
    description: 'Số tiền deposit đã trả (VND)',
    example: '100000.00',
  })
  @IsString()
  amountPaid!: string;

  @ApiProperty({
    description: 'Wallet transaction ID (transaction đã trừ tiền deposit)',
    example: 5,
  })
  @IsNumber()
  @IsPositive()
  walletTransactionId!: number;
}
