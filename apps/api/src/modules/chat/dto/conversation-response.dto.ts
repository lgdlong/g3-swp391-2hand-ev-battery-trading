import { ApiProperty } from '@nestjs/swagger';
import { SafeAccountDto } from '../../accounts/dto/safe-account.dto';
import { BasePostResponseDto } from '../../posts/dto/base-post-response.dto';

export class MessageInConversationDto {
  @ApiProperty({ example: '1' })
  id!: string;

  @ApiProperty({ example: 'Hello, is this battery still available?' })
  content!: string;

  @ApiProperty({ example: 456 })
  senderId!: number;

  @ApiProperty({ example: '1' })
  conversationId!: string;

  @ApiProperty({ example: '2023-10-27T10:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ type: SafeAccountDto })
  sender!: SafeAccountDto;
}

export class ConversationResponseDto {
  @ApiProperty({ example: '2' })
  id!: string;

  @ApiProperty({ example: '18' })
  postId!: string;

  @ApiProperty({ example: 19 })
  buyerId!: number;

  @ApiProperty({ example: 16 })
  sellerId!: number;

  @ApiProperty({ example: '2025-10-29T04:30:54.018Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2025-10-29T11:50:23.030Z' })
  updatedAt!: Date;

  @ApiProperty({ type: BasePostResponseDto })
  post!: BasePostResponseDto;

  @ApiProperty({ type: SafeAccountDto })
  buyer!: SafeAccountDto;

  @ApiProperty({ type: SafeAccountDto })
  seller!: SafeAccountDto;

  @ApiProperty({ type: MessageInConversationDto, nullable: true })
  lastMessage?: MessageInConversationDto;

  @ApiProperty({ type: [MessageInConversationDto], nullable: true })
  messages?: MessageInConversationDto[];
}
