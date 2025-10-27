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
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

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

  /**
   * Handle new WebSocket connection
   * Authenticate user and join them to their conversation rooms
   */
  async handleConnection(client: Socket) {
    try {
      // Extract JWT token from handshake auth
      const token = client.handshake.auth?.token;
      if (!token) {
        throw new UnauthorizedException('JWT token required');
      }

      // Verify and decode JWT
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      if (!userId) {
        throw new UnauthorizedException('Invalid token payload');
      }

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
      this.logger.error(`Connection failed: ${error.message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    this.logger.log(`User ${userId || 'unknown'} disconnected from chat`);
  }

  /**
   * FR-CHAT-M3: Handle sending messages
   * Listen for 'sendMessage' events and broadcast to conversation participants
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
    try {
      const userId = client.data?.userId;
      if (!userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      // Validate payload
      const sendMessageDto = plainToClass(SendMessageDto, payload);
      const errors = await validate(sendMessageDto);

      if (errors.length > 0) {
        const errorMessages = errors.map((error) => Object.values(error.constraints || {})).flat();
        client.emit('error', { message: 'Validation failed', errors: errorMessages });
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
        },
      });

      this.logger.log(
        `Message sent by user ${userId} in conversation ${sendMessageDto.conversationId}`,
      );
    } catch (error) {
      this.logger.error(`Send message failed: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  /**
   * Handle user joining a specific conversation room
   * Called when user opens a new conversation
   */
  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    try {
      const userId = client.data?.userId;
      if (!userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      const { conversationId } = payload;
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
      this.logger.error(`Join conversation failed: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  /**
   * Handle user leaving a conversation room
   */
  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    try {
      const userId = client.data?.userId;
      const { conversationId } = payload;

      if (conversationId) {
        const roomName = `conversation:${conversationId}`;
        await client.leave(roomName);
        client.emit('leftConversation', { conversationId });
        this.logger.log(`User ${userId} left conversation ${conversationId}`);
      }
    } catch (error) {
      this.logger.error(`Leave conversation failed: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }
}
