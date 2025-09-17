import { ApiProperty } from '@nestjs/swagger';
import { SummaryAccountDto } from '../../accounts/dto/summary-account.dto';

export class LoginResponse {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT dùng cho Authorization: Bearer <token>',
  })
  accessToken!: string;

  refreshToken?: string;

  @ApiProperty({ type: SummaryAccountDto })
  account!: SummaryAccountDto;
}
