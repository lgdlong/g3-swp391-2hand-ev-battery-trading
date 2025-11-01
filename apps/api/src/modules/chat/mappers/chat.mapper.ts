import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';
import {
  ConversationResponseDto,
  MessageInConversationDto,
} from '../dto/conversation-response.dto';
import { AccountMapper } from '../../accounts/mappers';
import { PostMapper } from '../../posts/mappers/post.mapper';

/**
 * Maps Message entity to MessageInConversationDto
 */
export function mapMessageToDto(message: Message): MessageInConversationDto {
  return {
    id: message.id,
    content: message.content,
    senderId: message.senderId,
    conversationId: message.conversationId,
    createdAt: message.createdAt,
    sender: AccountMapper.toSafeDto(message.sender),
  };
}

/**
 * Maps Conversation entity to ConversationResponseDto
 */
export function mapConversationToDto(conversation: Conversation): ConversationResponseDto {
  return {
    id: conversation.id,
    postId: conversation.postId,
    buyerId: conversation.buyerId,
    sellerId: conversation.sellerId,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    post: PostMapper.toBasePostResponseDto(conversation.post),
    buyer: AccountMapper.toSafeDto(conversation.buyer),
    seller: AccountMapper.toSafeDto(conversation.seller),
    lastMessage:
      conversation.messages?.length && conversation.messages[0]
        ? mapMessageToDto(conversation.messages[0])
        : undefined,
    messages: conversation.messages?.map(mapMessageToDto),
  };
}
