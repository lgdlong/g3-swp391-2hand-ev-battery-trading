import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { Post } from '../posts/entities/post.entity';

/**
 * Chat Module - Handles real-time messaging between buyers and sellers
 * Provides both RESTful API endpoints and WebSocket functionality
 */
@Module({
  imports: [
    // Import entities for TypeORM
    TypeOrmModule.forFeature([Conversation, Message, Post]),

    // Import JWT module for WebSocket authentication
    JwtModule.register({}), // Uses global JWT config
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService], // Export service for use in other modules if needed
})
export class ChatModule {}
