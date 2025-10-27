import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Wallet } from './wallet.entity';
import type { ServiceType } from '../../service-types/entities/service-type.entity';

@Entity({ name: 'wallet_transactions' })
export class WalletTransaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'wallet_user_id', type: 'int', nullable: false })
  walletUserId!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: false })
  amount!: string;

  @Column({ name: 'service_type_id', type: 'int', nullable: false })
  serviceTypeId!: number;

  @Column({ type: 'text', nullable: true })
  description: string | null = null;

  @Column({ name: 'related_entity_type', type: 'varchar', length: 50, nullable: true })
  relatedEntityType: string | null = null;

  @Column({ name: 'related_entity_id', type: 'varchar', length: 50, nullable: true })
  relatedEntityId: string | null = null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => require('./wallet.entity').Wallet)
  @JoinColumn({ name: 'wallet_user_id' })
  wallet!: Wallet;

  @ManyToOne(() => require('../../service-types/entities/service-type.entity').ServiceType)
  @JoinColumn({ name: 'service_type_id' })
  serviceType!: ServiceType;
}
