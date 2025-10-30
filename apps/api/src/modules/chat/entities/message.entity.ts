import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import type { Account } from '../../accounts/entities/account.entity';
import type { Conversation } from './conversation.entity';

/**
 * Message Entity - Represents individual messages within a conversation
 * Each message belongs to one conversation and has one sender
 */
@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'text' })
  content!: string;

  // Relationship to Sender (Account)
  @ManyToOne(() => require('../../accounts/entities/account.entity').Account, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sender_id' })
  sender!: Account;

  @Column({ name: 'sender_id', type: 'int' })
  senderId!: number;

  // Relationship to Conversation
  @ManyToOne(
    () => require('./conversation.entity').Conversation,
    (conversation: Conversation) => conversation.messages,
    { nullable: false, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'conversation_id' })
  conversation!: Conversation;

  @Column({ name: 'conversation_id', type: 'bigint' })
  conversationId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
