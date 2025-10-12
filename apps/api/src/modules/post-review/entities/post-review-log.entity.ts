import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import type { Post } from '../../posts/entities/post.entity';
import type { Account } from '../../accounts/entities/account.entity';
import { ReviewActionEnum } from '../../../shared/enums/review.enum';
import { PostStatus } from '../../../shared/enums/post.enum';

@Entity({ name: 'post_review_logs' })
@Index(['post', 'createdAt'])
export class PostReviewLog {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ManyToOne(() => require('../../posts/entities/post.entity').Post, (post: Post) => post.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post!: Post;
  postId!: string;

  @Column({ name: 'action', type: 'enum', enum: ReviewActionEnum })
  action!: ReviewActionEnum;

  @ManyToOne(() => require('../../accounts/entities/account.entity').Account, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'actor_id' })
  actor: Account | null = null;
  actorId!: string | null;

  @Column({ name: 'old_status', type: 'enum', enum: PostStatus, nullable: true })
  oldStatus: PostStatus | null = null;

  @Column({ name: 'new_status', type: 'enum', enum: PostStatus, nullable: true })
  newStatus: PostStatus | null = null;

  @Column({ name: 'reason', type: 'text', nullable: true })
  reason: string | null = null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
