import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { Account } from '../../accounts/entities/account.entity';

export enum FraudFlagStatus {
  SUSPECTED = 'SUSPECTED',
  CONFIRMED = 'CONFIRMED',
  CLEARED = 'CLEARED',
}

@Entity('post_fraud_flags')
export class PostFraudFlag {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'bigint', name: 'post_id' })
  postId: string;

  @Column({
    type: 'enum',
    enum: FraudFlagStatus,
    default: FraudFlagStatus.SUSPECTED,
  })
  status: FraudFlagStatus;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'bigint', name: 'flagged_by', nullable: true })
  flaggedBy: string | null;

  @CreateDateColumn({ name: 'flagged_at' })
  flaggedAt: Date;

  @Column({ type: 'bigint', name: 'reviewed_by', nullable: true })
  reviewedBy: string | null;

  @Column({ type: 'timestamp', name: 'reviewed_at', nullable: true })
  reviewedAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Post)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'flagged_by' })
  flaggedByAccount: Account | null;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedByAccount: Account | null;
}
