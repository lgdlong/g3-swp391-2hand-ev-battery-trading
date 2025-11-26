import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import type { Account } from '../../accounts/entities/account.entity';
import type { Post } from '../../posts/entities/post.entity';
import { OrderStatus } from '../../../shared/enums/order-status.enum';

@Entity({ name: 'orders' })
@Index(['buyerId'])
@Index(['sellerId'])
@Index(['postId'])
@Index(['status'])
export class Order {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code!: string;

  @Column({ name: 'buyer_id', type: 'int' })
  buyerId!: number;

  @Column({ name: 'seller_id', type: 'int' })
  sellerId!: number;

  @Column({ name: 'post_id', type: 'bigint' })
  postId!: string;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  amount!: string;

  @Column({ name: 'commission_fee', type: 'numeric', precision: 15, scale: 2, default: 0 })
  commissionFee!: string;

  @Column({ name: 'seller_receive_amount', type: 'numeric', precision: 15, scale: 2, default: 0 })
  sellerReceiveAmount!: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt: Date | null = null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null = null;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date | null = null;

  @Column({ type: 'text', nullable: true })
  note: string | null = null;

  // Relations
  @ManyToOne(() => require('../../accounts/entities/account.entity').Account)
  @JoinColumn({ name: 'buyer_id' })
  buyer!: Account;

  @ManyToOne(() => require('../../accounts/entities/account.entity').Account)
  @JoinColumn({ name: 'seller_id' })
  seller!: Account;

  @ManyToOne(() => require('../../posts/entities/post.entity').Post)
  @JoinColumn({ name: 'post_id' })
  post!: Post;
}
