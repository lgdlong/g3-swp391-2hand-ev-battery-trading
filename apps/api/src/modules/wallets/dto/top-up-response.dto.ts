import { ApiProperty } from '@nestjs/swagger';
import { WalletResponseDto } from './wallet-response.dto';
import { WalletTransactionResponseDto } from './wallet-transaction-response.dto';

export class TopUpResponseDto {
  @ApiProperty({ type: WalletResponseDto })
  wallet!: WalletResponseDto;

  @ApiProperty({ type: WalletTransactionResponseDto })
  transaction!: WalletTransactionResponseDto;
}
