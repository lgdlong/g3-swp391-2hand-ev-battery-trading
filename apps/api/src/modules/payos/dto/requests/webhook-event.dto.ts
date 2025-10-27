import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { WebhookPayosDataDto } from './webhook-data.dto';

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
    type: WebhookPayosDataDto,
  })
  @ValidateNested()
  @Type(() => WebhookPayosDataDto)
  @IsNotEmpty()
  data!: WebhookPayosDataDto;

  @ApiProperty({
    description: 'Security signature for webhook verification',
    example: 'abcdef123456789signature',
  })
  @IsString()
  @IsNotEmpty()
  signature!: string;
}
