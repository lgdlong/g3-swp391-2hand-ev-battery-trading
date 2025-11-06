import { Controller, Post, Get, Body, Param, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { User } from '../../core/decorators/user.decorator';
import type { AuthUser } from '../../core/guards/roles.guard';

/**
 * Chat Controller - RESTful API endpoints for chat functionality
 * Handles conversation creation and message retrieval
 */
@ApiTags('Chat')
@Controller('conversations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * FR-CHAT-M1: Create or get existing conversation
   * POST /conversations
   */
  @Post()
  @ApiOperation({
    summary: 'Create or get conversation',
    description: 'Create a new conversation or return existing one for a post and buyer pair',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Existing conversation returned',
    type: ConversationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'New conversation created',
    type: ConversationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or buyer cannot chat with themselves',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Post not found',
  })
  async createOrGetConversation(
    @Body() createConversationDto: CreateConversationDto,
    @User() user: AuthUser,
  ) {
    const conversation = await this.chatService.createOrGetConversation(
      createConversationDto,
      user.sub,
    );

    return {
      success: true,
      data: conversation,
      message: 'Conversation ready',
    };
  }

  /**
   * FR-CHAT-M2: Get all conversations for current user
   * GET /conversations
   */
  @Get()
  @ApiOperation({
    summary: 'Get user conversations',
    description: 'Get all conversations where user is either buyer or seller',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conversations retrieved successfully',
    type: [ConversationResponseDto],
  })
  async getUserConversations(@User() user: AuthUser) {
    const conversations = await this.chatService.getUserConversations(user.sub);

    return {
      success: true,
      data: conversations,
      message: 'Conversations retrieved successfully',
    };
  }

  /**
   * FR-CHAT-M4: Get messages for a conversation
   * GET /conversations/:id/messages
   */
  @Get(':id/messages')
  @ApiOperation({
    summary: 'Get conversation messages',
    description: 'Get paginated messages for a specific conversation',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Messages retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have access to this conversation',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Conversation not found',
  })
  async getConversationMessages(
    @Param('id') conversationId: string,
    @User() user: AuthUser,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    const result = await this.chatService.getConversationMessages(
      conversationId,
      user.sub,
      page,
      limit,
    );

    return {
      success: true,
      data: result.messages,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
      message: 'Messages retrieved successfully',
    };
  }

  /**
   * ✨ NEW: Get conversations by message status
   * GET /conversations/filter/by-status
   */
  @Get('filter/by-status')
  @ApiOperation({
    summary: 'Get conversations by message status',
    description: `Filter conversations based on whether they contain messages or not.

    Use Cases:
    - Find empty conversations (hasMessages=false) for cleanup
    - Find active conversations with messages (hasMessages=true)
    - Analytics on conversation engagement

    Query Parameters:
    - hasMessages: true (conversations with at least 1 message) | false (conversations with 0 messages)
    - page: Page number for pagination (default: 1)
    - limit: Items per page (default: 20, max recommended: 50)`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conversations retrieved successfully with pagination metadata',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ConversationResponseDto' },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 45 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            totalPages: { type: 'number', example: 3 },
          },
        },
        message: { type: 'string', example: 'Conversations retrieved successfully' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication token missing or invalid',
  })
  async getConversationsByStatus(
    @Query('hasMessages') hasMessages: boolean = true,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.chatService.getConversationsByMessageStatus(hasMessages, page, limit);

    return {
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
      message: 'Conversations retrieved successfully',
    };
  }

  /**
   * ✨ NEW: Get conversation statistics
   * GET /conversations/stats/overview
   */
  @Get('stats/overview')
  @ApiOperation({
    summary: 'Get conversation statistics',
    description: `Get comprehensive statistics about all conversations in the system.

    Returns:
    - Total number of conversations
    - Count of conversations with messages (active)
    - Count of conversations without messages (inactive/abandoned)

    Use Cases:
    - Admin dashboard analytics
    - Monitor conversation engagement rate
    - Identify cleanup opportunities (empty conversations)
    - Track platform activity metrics`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalConversations: {
              type: 'number',
              example: 150,
              description: 'Total number of conversations in the system',
            },
            conversationsWithMessages: {
              type: 'number',
              example: 120,
              description: 'Conversations that have at least one message',
            },
            conversationsWithoutMessages: {
              type: 'number',
              example: 30,
              description: 'Conversations that have never received any messages',
            },
          },
        },
        message: { type: 'string', example: 'Statistics retrieved successfully' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication token missing or invalid',
  })
  async getConversationStats() {
    const stats = await this.chatService.getConversationStats();

    return {
      success: true,
      data: stats,
      message: 'Statistics retrieved successfully',
    };
  }
}
