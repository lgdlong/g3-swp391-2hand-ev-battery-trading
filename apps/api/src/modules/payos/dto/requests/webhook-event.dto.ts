import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WebhookPayosDto {
  @ApiProperty({
    description: 'Response code from PayOS webhook',
    example: '00',
  })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({
    description: 'Response description from PayOS webhook',
    example: 'success',
  })
  @IsString()
  @IsNotEmpty()
  desc!: string;

  @ApiProperty({
    description: 'Webhook data payload from PayOS',
    example: {
      orderCode: 123456789,
      amount: 50000,
      description: 'Payment for EV Battery',
      accountNumber: '12345678',
      reference: 'REF123',
      transactionDateTime: '2024-01-01T10:00:00.000Z',
      currency: 'VND',
      paymentLinkId: 'payment-link-id',
      code: '00',
      desc: 'Thành công',
      counterAccountBankId: null,
      counterAccountBankName: null,
      counterAccountName: null,
      counterAccountNumber: null,
      virtualAccountName: null,
      virtualAccountNumber: null,
    },
  })
  @IsNotEmpty()
  data!: any;

  @ApiProperty({
    description: 'Security signature for webhook verification',
    example: 'abcdef123456789signature',
  })
  @IsString()
  @IsNotEmpty()
  signature!: string;
}
