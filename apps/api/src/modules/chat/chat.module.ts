import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { AuthModule } from '../auth/auth.module';
import { Post } from '../posts/entities/post.entity';

/**
 * Chat Module - Handles real-time messaging between buyers and sellers
 * Provides both RESTful API endpoints and WebSocket functionality
 */
@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message, Post]), AuthModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService], // Export service for use in other modules if needed
})
export class ChatModule {}
