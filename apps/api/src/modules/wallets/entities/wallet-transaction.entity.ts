import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Wallet } from './wallet.entity';
import { WalletTransactionType } from '../../../shared/enums/wallet-transaction-type.enum';

@Entity({ name: 'wallet_transactions' })
export class WalletTransaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'wallet_user_id', type: 'int', nullable: false })
  walletUserId!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: false })
  amount!: string;

  @Column({
    name: 'transaction_type',
    type: 'enum',
    enum: WalletTransactionType,
    nullable: false,
  })
  transactionType!: WalletTransactionType;

  @Column({ type: 'text', nullable: true })
  description: string | null = null;

  @Column({ name: 'related_entity_id', type: 'varchar', length: 50, nullable: true })
  relatedEntityId: string | null = null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => require('./wallet.entity').Wallet)
  @JoinColumn({ name: 'wallet_user_id' })
  wallet!: Wallet;
}
