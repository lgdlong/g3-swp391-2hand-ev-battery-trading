import { SummaryAccountDto } from './summary-account.dto';

export class CreateAccountResponseDto {
  account!: SummaryAccountDto;
  message!: string;
}
