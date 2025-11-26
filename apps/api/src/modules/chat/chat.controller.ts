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
}
