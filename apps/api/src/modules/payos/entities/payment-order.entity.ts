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
import { PaymentStatus } from '../../../shared/enums/payment-status.enum';

@Entity({ name: 'payment_orders' })
@Index(['payableId', 'payableType'])
export class PaymentOrder {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'account_id', type: 'int', nullable: false })
  accountId!: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: false })
  amount!: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  @Column({ name: 'payable_id', type: 'bigint', nullable: true })
  payableId: string | null = null;

  @Column({ name: 'payable_type', type: 'varchar', length: 50, nullable: true })
  payableType: string | null = null;

  @Column({ name: 'payment_ref', type: 'varchar', length: 255, nullable: true })
  paymentRef: string | null = null;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date | null = null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => require('../../accounts/entities/account.entity').Account)
  @JoinColumn({ name: 'account_id' })
  account!: Account;
}
