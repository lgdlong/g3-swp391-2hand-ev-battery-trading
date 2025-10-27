import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import type { Account } from '../../accounts/entities/account.entity';
import type { Post } from '../../posts/entities/post.entity';
import { Message } from './message.entity';

/**
 * Conversation Entity - Represents a chat conversation between a buyer and seller about a specific post
 * Ensures uniqueness per (post, buyer) combination to prevent duplicate conversations
 */
@Entity({ name: 'conversations' })
@Unique(['post', 'buyer']) // Ensures one conversation per post-buyer pair
export class Conversation {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  // Relationship to Post - the subject of conversation
  @ManyToOne(() => require('../../posts/entities/post.entity').Post, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @Column({ name: 'post_id', type: 'bigint' })
  postId!: string;

  // Relationship to Buyer (Account)
  @ManyToOne(() => require('../../accounts/entities/account.entity').Account, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'buyer_id' })
  buyer!: Account;

  @Column({ name: 'buyer_id', type: 'int' })
  buyerId!: number;

  // Relationship to Seller (Account)
  @ManyToOne(() => require('../../accounts/entities/account.entity').Account, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'seller_id' })
  seller!: Account;

  @Column({ name: 'seller_id', type: 'int' })
  sellerId!: number;

  // Relationship to Messages
  @OneToMany(() => require('./message.entity').Message, 'conversation', {
    cascade: true,
  })
  messages!: Message[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
