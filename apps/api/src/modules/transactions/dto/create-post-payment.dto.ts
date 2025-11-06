import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsNotEmpty } from 'class-validator';

export class CreatePostPaymentDto {
  @ApiProperty({
    description: 'ID of the post being paid for',
    example: '123',
  })
  @IsString()
  @IsNotEmpty()
  postId!: string;

  @ApiProperty({
    description: 'ID of the account making the payment',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  accountId!: number;

  @ApiProperty({
    description: 'Amount paid for the post',
    example: '50000.00',
  })
  @IsString()
  @IsNotEmpty()
  amountPaid!: string;

  @ApiProperty({
    description: 'ID of the wallet transaction record',
    example: 456,
  })
  @IsNumber()
  @IsPositive()
  walletTransactionId!: number;
}
