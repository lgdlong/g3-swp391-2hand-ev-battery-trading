import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PayosTransactionInfo {
  @ApiProperty({
    description: 'Bank account number',
    example: '22800957',
  })
  accountNumber!: string;

  @ApiProperty({
    description: 'Transaction amount',
    example: 2000,
  })
  amount!: number;

  @ApiPropertyOptional({
    description: 'Counter account bank ID',
    example: null,
  })
  counterAccountBankId!: string | null;

  @ApiProperty({
    description: 'Counter account bank name',
    example: 'TMCP Ngoai Thuong Viet Nam',
  })
  counterAccountBankName!: string;

  @ApiProperty({
    description: 'Counter account holder name',
    example: 'PHUNG LUU HOANG LONG198 Tran Quang Khai, Ha Noi',
  })
  counterAccountName!: string;

  @ApiProperty({
    description: 'Counter account number',
    example: '1038182261',
  })
  counterAccountNumber!: string;

  @ApiProperty({
    description: 'Transaction description',
    example:
      'MBVCB.11399888660.5294BFTVG2CHUGL4.CSFS1XKQZ00.CT tu 1038182261 PHUNG LUU HOANG LONG toi LOCCASS000334316 DUONG QUOC THAI tai ACB GD 405823-102125 15:02:35',
  })
  description!: string;

  @ApiProperty({
    description: 'Transaction reference number',
    example: '3594',
  })
  reference!: string;

  @ApiProperty({
    description: 'Transaction date and time',
    example: '2025-10-21T15:02:36+07:00',
  })
  transactionDateTime!: string;

  @ApiProperty({
    description: 'Virtual account name',
    example: 'DUONG QUOC THAI',
  })
  virtualAccountName!: string;

  @ApiProperty({
    description: 'Virtual account number',
    example: 'LOCCASS000334316',
  })
  virtualAccountNumber!: string;
}
