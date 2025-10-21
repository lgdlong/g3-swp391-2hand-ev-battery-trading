import { ApiProperty } from '@nestjs/swagger';

export class PayosPaymentLinkResponse {
  @ApiProperty({
    description: 'Bank identification number',
    example: '970416',
  })
  bin!: string;

  @ApiProperty({
    description: 'Account number for payment',
    example: 'LOCCASS000334316',
  })
  accountNumber!: string;

  @ApiProperty({
    description: 'Account holder name',
    example: 'DUONG QUOC THAI',
  })
  accountName!: string;

  @ApiProperty({
    description: 'Payment amount in Vietnamese Dong (VND)',
    example: 2000,
  })
  amount!: number;

  @ApiProperty({
    description: 'Payment description/reference',
    example: 'CSZADLVCUB9',
  })
  description!: string;

  @ApiProperty({
    description: 'Unique order code for the payment',
    example: 6,
  })
  orderCode!: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'VND',
  })
  currency!: string;

  @ApiProperty({
    description: 'Payment link ID',
    example: '39664ca244ea46c8969cc461a6834a39',
  })
  paymentLinkId!: string;

  @ApiProperty({
    description: 'Payment status',
    example: 'PENDING',
    enum: ['PENDING', 'PROCESSING', 'PAID', 'CANCELLED'],
  })
  status!: string;

  @ApiProperty({
    description: 'Payment checkout URL',
    example: 'https://pay.payos.vn/web/39664ca244ea46c8969cc461a6834a39',
  })
  checkoutUrl!: string;

  @ApiProperty({
    description: 'QR code for payment (VietQR format)',
    example:
      '00020101021238600010A000000727013000069704160116LOCCASS0003343160208QRIBFTTA5303704540420005802VN62150811CSZADLVCUB963046739',
  })
  qrCode!: string;
}

export class PayosCreatePaymentResponse {
  @ApiProperty({
    description: 'Response code from PayOS',
    example: '00',
  })
  code!: string;

  @ApiProperty({
    description: 'Response description',
    example: 'success',
  })
  desc!: string;

  @ApiProperty({
    description: 'Payment data',
    type: PayosPaymentLinkResponse,
  })
  data!: PayosPaymentLinkResponse;

  @ApiProperty({
    description: 'Response signature',
    example: 'cb1cef94fe9291abe7694266467be8836076adfd70ddd8efab0bb682c0c037bf',
  })
  signature!: string;
}
