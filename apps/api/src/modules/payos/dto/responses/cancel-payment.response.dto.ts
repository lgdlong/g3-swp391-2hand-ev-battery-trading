import { ApiProperty } from '@nestjs/swagger';
import { PayosPaymentInfo } from './payment-info.response.dto';

export class PayosCancelPaymentResponse {
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
    description: 'Cancelled payment information',
    type: PayosPaymentInfo,
  })
  data!: PayosPaymentInfo;

  @ApiProperty({
    description: 'Response signature',
    example: 'signature-hash',
  })
  signature!: string;
}
