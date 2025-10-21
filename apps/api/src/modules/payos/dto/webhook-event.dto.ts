import { IsString } from 'class-validator';

export class WebhookPayosDto {
  @IsString()
  code!: string;
  @IsString()
  desc!: string;
  @IsString()
  data!: any;
  @IsString()
  signature!: string;
}
