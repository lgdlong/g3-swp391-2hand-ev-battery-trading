import { ApiProperty } from '@nestjs/swagger';
import { SummaryAccountDto } from './summary-account.dto';

export class CreateAccountResponseDto {
  @ApiProperty({ type: SummaryAccountDto })
  account!: SummaryAccountDto;

  @ApiProperty({ example: 'Account created successfully' })
  message!: string;
}
