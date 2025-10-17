import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { Account } from '../../accounts/entities/account.entity';
import type { Post } from '../../posts/entities/post.entity';

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity({ name: 'post_verification_requests' })
@Index(['status', 'requestedAt'])
export class PostVerificationRequest {
  @PrimaryColumn({ type: 'bigint', name: 'post_id' })
  postId!: string;

  @ManyToOne(() => require('../../posts/entities/post.entity').Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @Column({ type: 'int', name: 'requested_by' })
  requestedBy!: number;

  @ManyToOne(() => require('../../accounts/entities/account.entity').Account, {
    nullable: true,
    onDelete: 'SET NULL'
  })
  @JoinColumn({ name: 'requested_by' })
  requester!: Account;

  @Column({ type: 'timestamp', name: 'requested_at', default: () => 'CURRENT_TIMESTAMP' })
  requestedAt!: Date;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status!: VerificationStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'reviewed_at' })
  reviewedAt: Date | null = null;

  @Column({ type: 'text', nullable: true, name: 'reject_reason' })
  rejectReason: string | null = null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
