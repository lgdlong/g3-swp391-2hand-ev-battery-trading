import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import type { Account } from '../../accounts/entities/account.entity';
import type { WalletTransaction } from '../../wallets/entities/wallet-transaction.entity';

@Entity({ name: 'post_payments' })
export class PostPayment {
  @PrimaryColumn({ name: 'post_id', type: 'bigint' })
  postId!: string;

  @Column({ name: 'account_id', type: 'int', nullable: false })
  accountId!: number;

  @Column({ name: 'amount_paid', type: 'decimal', precision: 14, scale: 2, nullable: false })
  amountPaid!: string;

  @Column({ name: 'wallet_transaction_id', type: 'int', unique: true, nullable: false })
  walletTransactionId!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => require('../../accounts/entities/account.entity').Account)
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @OneToOne(() => require('../../wallets/entities/wallet-transaction.entity').WalletTransaction)
  @JoinColumn({ name: 'wallet_transaction_id' })
  walletTransaction!: WalletTransaction;
}
