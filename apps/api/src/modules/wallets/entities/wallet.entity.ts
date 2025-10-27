import { Entity, Column, PrimaryColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import type { Account } from '../../accounts/entities/account.entity';

@Entity({ name: 'wallets' })
export class Wallet {
  @PrimaryColumn({ name: 'user_id', type: 'int' })
  userId!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: false, default: 0 })
  balance!: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @OneToOne(() => require('../../accounts/entities/account.entity').Account)
  @JoinColumn({ name: 'user_id' })
  user!: Account;
}
