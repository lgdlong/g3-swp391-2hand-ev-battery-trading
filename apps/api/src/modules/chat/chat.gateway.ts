import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JoinConversationDto } from './dto/join-conversation.dto';
import { LeaveConversationDto } from './dto/leave-conversation.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

/**
 * Chat Gateway - WebSocket handler for real-time messaging
 * Manages WebSocket connections, authentication, and message broadcasting
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Get access token from headers
      const token = client.handshake.auth.token as string | undefined;

      if (!token) throw new UnauthorizedException('JWT token required');

      if (Array.isArray(token)) throw new UnauthorizedException('Invalid token format');

      // Verify and decode JWT
      const payload: JwtPayload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      if (!userId) throw new UnauthorizedException('Invalid token payload');

      // Store user info in socket
      client.data.userId = userId;

      // Get all conversation IDs for this user
      const conversationIds = await this.chatService.getUserConversationIds(userId);

      // Join user to all their conversation rooms
      for (const conversationId of conversationIds) {
        const roomName = `conversation:${conversationId}`;
        await client.join(roomName);
        this.logger.log(`User ${userId} joined room ${roomName}`);
      }

      this.logger.log(`User ${userId} connected to chat`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Connection failed: ${errorMessage}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId as number | undefined;
    if (userId) {
      this.logger.log(`User ${userId} disconnected from chat`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() sendMessageDto: SendMessageDto,
  ) {
    try {
      const userId = client.data?.userId as number | undefined;
      if (!userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      // Verify access to conversation before sending message
      const hasAccess = await this.chatService.verifyConversationAccess(
        sendMessageDto.conversationId,
        userId,
      );

      if (!hasAccess) {
        client.emit('error', { message: 'Access denied to conversation' });
        return;
      }

      // Send message through service
      const message = await this.chatService.sendMessage(sendMessageDto, userId);

      // Broadcast message to conversation room
      const roomName = `conversation:${sendMessageDto.conversationId}`;
      this.server.to(roomName).emit('newMessage', {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        conversationId: message.conversationId,
        createdAt: message.createdAt,
        sender: {
          id: message.sender.id,
          fullName: message.sender.fullName,
          avatarUrl: message.sender.avatarUrl || null,
        },
      });

      this.logger.log(
        `Message sent by user ${userId} in conversation ${sendMessageDto.conversationId}`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Send message failed';
      this.logger.error(`Send message failed: ${errorMessage}`);
      client.emit('error', { message: errorMessage });
    }
  }

  /**
   * Handle user joining a specific conversation room
   * Called when user opens a new conversation
   */
  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() joinConversationDto: JoinConversationDto,
  ) {
    try {
      const userId = client.data?.userId as number | undefined;
      if (!userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      const { conversationId } = joinConversationDto;
      if (!conversationId) {
        client.emit('error', { message: 'Conversation ID required' });
        return;
      }

      // Verify user has access to conversation
      const hasAccess = await this.chatService.verifyConversationAccess(conversationId, userId);

      if (!hasAccess) {
        client.emit('error', { message: 'Access denied to conversation' });
        return;
      }

      // Join conversation room
      const roomName = `conversation:${conversationId}`;
      await client.join(roomName);

      client.emit('joinedConversation', { conversationId });
      this.logger.log(`User ${userId} joined conversation ${conversationId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Join conversation failed';
      this.logger.error(`Join conversation failed: ${errorMessage}`);
      client.emit('error', { message: errorMessage });
    }
  }

  /**
   * Handle user leaving a conversation room
   */
  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() leaveConversationDto: LeaveConversationDto,
  ) {
    try {
      const userId = client.data?.userId as number | undefined;
      const { conversationId } = leaveConversationDto;

      if (conversationId) {
        const roomName = `conversation:${conversationId}`;
        await client.leave(roomName);
        client.emit('leftConversation', { conversationId });
        this.logger.log(`User ${userId} left conversation ${conversationId}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Leave conversation failed';
      this.logger.error(`Leave conversation failed: ${errorMessage}`);
      client.emit('error', { message: errorMessage });
    }
  }

  /**
   * Send confirmation card signal to client (for buyer to see pending confirmation)
   * Called by TransactionsService when seller initiates confirmation
   *
   * @param conversationId - ID of conversation to send signal to
   * @param contractId - ID of the contract created
   */
  public sendConfirmationCard(conversationId: number, contractId: string): void {
    const roomName = `conversation:${conversationId}`;
    this.server.to(roomName).emit('server:show_confirmation_card', {
      contractId: contractId,
      actionParty: 'BUYER',
      timestamp: new Date().toISOString(),
    });
    this.logger.log(
      `Sent confirmation card for contract ${contractId} to conversation ${conversationId}`,
    );
  }

  /**
   * Send confirmation complete signal to client (transaction completed)
   * Called by TransactionsService when buyer confirms
   *
   * @param conversationId - ID of conversation to send signal to
   * @param contractId - ID of the completed contract
   * @param pdfUrl - URL of the generated PDF contract
   */
  public sendConfirmationComplete(
    conversationId: number,
    contractId: string,
    pdfUrl: string,
  ): void {
    const roomName = `conversation:${conversationId}`;
    this.server.to(roomName).emit('server:confirmation_complete', {
      contractId: contractId,
      isFinal: true,
      pdfUrl: pdfUrl,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(
      `Sent confirmation complete for contract ${contractId} to conversation ${conversationId}`,
    );
  }
}
