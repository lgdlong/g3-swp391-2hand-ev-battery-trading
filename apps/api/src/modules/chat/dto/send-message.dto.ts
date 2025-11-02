import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for sending a message through WebSocket
 * Contains conversation ID and message content
 */
export class SendMessageDto {
  @ApiProperty({
    description: 'ID of the conversation to send message to',
    example: '1',
  })
  @IsNotEmpty({ message: 'Conversation ID is required' })
  @IsString({ message: 'Conversation ID must be a string' })
  conversationId!: string;

  @ApiProperty({
    description: 'Content of the message',
    example: 'Hello, is this battery still available?',
  })
  @IsNotEmpty({ message: 'Message content is required' })
  @IsString({ message: 'Message content must be a string' })
  content!: string;
}
