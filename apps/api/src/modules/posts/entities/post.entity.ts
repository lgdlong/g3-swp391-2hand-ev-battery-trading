import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import type { Account } from '../../accounts/entities/account.entity';
import { PostStatus } from '../../../shared/enums/post-status.enum';
import { PostType } from '../../../shared/enums/post-type.enum';

@Entity({ name: 'posts' })
@Index(['wardCode'])
@Index(['status', 'submittedAt'])
@Index(['seller', 'status'])
export class Post {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ManyToOne(
    () => require('../../accounts/entities/account.entity').Account,
    (account: Account) => account.posts,
    { nullable: false, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'seller_id' })
  seller!: Account;

  @Column({ type: 'enum', enum: PostType })
  postType!: PostType;

  @Column({ type: 'varchar', length: 120 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 10 })
  wardCode!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  provinceNameCached: string | null = null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  districtNameCached: string | null = null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  wardNameCached: string | null = null;

  @Column({ type: 'text', nullable: true })
  addressTextCached: string | null = null;

  @Column({ type: 'numeric', precision: 14, scale: 0 })
  priceVnd!: string;

  @Column({ type: 'boolean', default: false })
  isNegotiable!: boolean;

  @Column({ type: 'enum', enum: PostStatus, default: PostStatus.DRAFT })
  status!: PostStatus;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date | null = null;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date | null = null;

  @ManyToOne(() => require('./../../accounts/entities/account.entity').Account, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy: Account | null = null;

  @Column({ type: 'text', nullable: true })
  rejectReason: string | null = null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
