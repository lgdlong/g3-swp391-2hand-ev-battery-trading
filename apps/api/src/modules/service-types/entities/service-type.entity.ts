import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import type { WalletTransaction } from '../../wallets/entities/wallet-transaction.entity';
import type { PaymentOrder } from '../../payos/entities/payment-order.entity';

@Entity({ name: 'service_types' })
export class ServiceType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  code!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description: string | null = null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relations
  @OneToMany(
    () => require('../../wallets/entities/wallet-transaction.entity').WalletTransaction,
    'serviceType',
  )
  walletTransactions!: WalletTransaction[];

  @OneToMany(() => require('../../payos/entities/payment-order.entity').PaymentOrder, 'serviceType')
  paymentOrders!: PaymentOrder[];
}
