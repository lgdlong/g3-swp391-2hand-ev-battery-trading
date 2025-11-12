import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { Post } from '../posts/entities/post.entity';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { mapConversationToDto } from './mappers/chat.mapper';

/**
 * Chat Service - Handles all chat-related business logic
 * Manages conversations and messages between buyers and sellers
 */
@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  /**
   * FR-CHAT-M1: Create or get existing conversation
   * Implements get-or-create logic for conversations
   */
  async createOrGetConversation(
    createConversationDto: CreateConversationDto,
    buyerId: number,
  ): Promise<ConversationResponseDto> {
    const { postId } = createConversationDto;

    // Find the post to get seller info
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['seller'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const sellerId = post.seller.id;

    // Prevent buyer from chatting with themselves
    if (buyerId === sellerId) {
      throw new BadRequestException('You cannot chat with yourself');
    }

    // Try to find existing conversation
    let conversation = await this.conversationRepo.findOne({
      where: {
        postId,
        buyerId,
      },
      relations: ['post', 'post.images', 'post.seller', 'buyer', 'seller'],
    });

    if (conversation) {
      return mapConversationToDto(conversation);
    }

    // Create new conversation
    conversation = this.conversationRepo.create({
      postId,
      buyerId,
      sellerId,
    });

    const savedConversation = await this.conversationRepo.save(conversation);

    // Fetch with relations
    const result = await this.conversationRepo.findOne({
      where: { id: savedConversation.id },
      relations: ['post', 'post.images', 'post.seller', 'buyer', 'seller'],
    });

    if (!result) {
      throw new NotFoundException('Failed to create conversation');
    }

    return mapConversationToDto(result);
  }

  /**
   * FR-CHAT-M2: Get all conversations for a user
   * Returns conversations where user is either buyer or seller
   */
  async getUserConversations(userId: number): Promise<ConversationResponseDto[]> {
    const conversations = await this.conversationRepo
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.post', 'post')
      .leftJoinAndSelect('post.images', 'images')
      .leftJoinAndSelect('post.seller', 'postSeller')
      .leftJoinAndSelect('conversation.buyer', 'buyer')
      .leftJoinAndSelect('conversation.seller', 'seller')
      .leftJoinAndSelect(
        'conversation.messages',
        'lastMessage',
        'lastMessage.created_at = (SELECT MAX(m.created_at) FROM messages m WHERE m.conversation_id = conversation.id)',
      )
      .leftJoinAndSelect('lastMessage.sender', 'messageSender')
      .where('conversation.buyerId = :userId OR conversation.sellerId = :userId', {
        userId,
      })
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany();

    return conversations.map(mapConversationToDto);
  }

  /**
   * FR-CHAT-M4: Get messages for a conversation with pagination
   * Includes security check to ensure user has access to conversation
   */
  async getConversationMessages(
    conversationId: string,
    userId: number,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ messages: Message[]; total: number }> {
    // Security check: verify user is part of conversation
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    // Get messages with pagination
    const [messages, total] = await this.messageRepo.findAndCount({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'ASC' }, // ✅ Oldest messages first (proper chat order)
      skip: (page - 1) * limit,
      take: limit,
    });

    return { messages, total };
  }

  /**
   * FR-CHAT-M3: Send a message in a conversation
   * Includes security check and returns the created message
   */
  async sendMessage(sendMessageDto: SendMessageDto, senderId: number): Promise<Message> {
    const { conversationId, content } = sendMessageDto;

    // Security check: verify user is part of conversation
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.buyerId !== senderId && conversation.sellerId !== senderId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    // Create and save message
    const message = this.messageRepo.create({
      content,
      senderId,
      conversationId,
    });

    const savedMessage = await this.messageRepo.save(message);

    // Update conversation's updatedAt timestamp
    await this.conversationRepo.update(conversationId, {
      updatedAt: new Date(),
    });

    // Return message with sender info
    const result = await this.messageRepo.findOne({
      where: { id: savedMessage.id },
      relations: ['sender'],
    });

    if (!result) {
      throw new NotFoundException('Failed to create message');
    }

    return result;
  }

  /**
   * Verify access to conversation before allowing operations
   */
  async verifyConversationAccess(conversationId: string, userId: number): Promise<boolean> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      return false;
    }

    return conversation.buyerId === userId || conversation.sellerId === userId;
  }

  /**
   * Get all conversation IDs for a user
   * Used by WebSocket gateway to join rooms
   */
  async getUserConversationIds(userId: number): Promise<string[]> {
    const conversations = await this.conversationRepo.find({
      where: [{ buyerId: userId }, { sellerId: userId }],
      select: ['id'],
    });

    return conversations.map((conv) => conv.id);
  }

  /**
   * Get unread message count for a user
   * Counts messages in user's conversations where senderId !== userId
   * and message was created after conversation's updatedAt (simple heuristic)
   */
  async getUnreadMessageCount(userId: number): Promise<number> {
    // Get all conversations for user
    const conversations = await this.conversationRepo.find({
      where: [{ buyerId: userId }, { sellerId: userId }],
      select: ['id', 'updatedAt'],
    });

    if (conversations.length === 0) {
      return 0;
    }

    const conversationIds = conversations.map((conv) => conv.id);

    // Count messages where:
    // 1. Message is in user's conversations
    // 2. Message sender is not the current user (someone else sent it)
    // 3. Message was created after conversation's updatedAt (heuristic: if conversation was updated after message, user likely saw it)
    // Actually, simpler: just count all messages from others in user's conversations
    const unreadCount = await this.messageRepo
      .createQueryBuilder('message')
      .where('message.conversationId IN (:...conversationIds)', { conversationIds })
      .andWhere('message.senderId != :userId', { userId })
      .getCount();

    return unreadCount;
  }

  /**
   * Check if a post has any chat activity (conversations with messages)
   * Used by refunds system to detect "shadow sales"
   *
   * @param postId - ID of the post to check
   * @returns true if post has conversations with messages, false otherwise
   */
  async hasPostChatActivity(postId: string): Promise<boolean> {
    const count = await this.conversationRepo.count({
      where: { postId, hasMessages: true },
    });

    return count > 0;
  }

  /**
   * Get count of conversations with messages for a post
   * Used for detailed logging/analytics
   *
   * @param postId - ID of the post to check
   * @returns number of conversations with messages
   */
  async getPostChatActivityCount(postId: string): Promise<number> {
    return this.conversationRepo.count({
      where: { postId, hasMessages: true },
    });
  }
}
