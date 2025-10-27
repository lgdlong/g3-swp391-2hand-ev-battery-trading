import { ApiProperty } from '@nestjs/swagger';

export class WebhookResponse {
  @ApiProperty({
    description: 'Webhook acknowledgment message',
    example: 'Webhook received',
  })
  message!: string;
}
