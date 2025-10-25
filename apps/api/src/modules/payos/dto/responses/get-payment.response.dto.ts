import { ApiProperty } from '@nestjs/swagger';
import { PayosPaymentInfo } from './payment-info.response.dto';

export class PayosGetPaymentResponse {
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
    description: 'Payment information',
    type: PayosPaymentInfo,
  })
  data!: PayosPaymentInfo;

  @ApiProperty({
    description: 'Response signature',
    example: '6579c60e09245119ade06afd48f089e207a75dbc941e8af73fa37c92df629f1c',
  })
  signature!: string;
}
