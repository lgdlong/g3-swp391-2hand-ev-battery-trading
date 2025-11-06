import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import type { Account } from '../../accounts/entities/account.entity';
import { ContractStatus } from '../../../shared/enums/contract-status.enum';

@Entity({ name: 'contracts' })
@Index(['listingId'])
@Index(['status'])
export class Contract {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'listing_id', type: 'bigint', nullable: false })
  listingId!: string;

  @Column({ name: 'buyer_id', type: 'int', nullable: false })
  buyerId!: number;

  @Column({ name: 'seller_id', type: 'int', nullable: false })
  sellerId!: number;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.AWAITING_CONFIRMATION,
  })
  status!: ContractStatus;

  @Column({ name: 'is_external_transaction', type: 'boolean', default: false })
  isExternalTransaction!: boolean;

  @Column({ name: 'file_path', type: 'text', nullable: true })
  filePath: string | null = null;

  @Column({ name: 'listing_snapshot', type: 'jsonb', nullable: true })
  listingSnapshot: Record<string, any> | null = null;

  @Column({ name: 'fee_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  feeRate: string | null = null;

  @Column({ name: 'buyer_confirmed_at', type: 'timestamp', nullable: true })
  buyerConfirmedAt: Date | null = null;

  @Column({ name: 'seller_confirmed_at', type: 'timestamp', nullable: true })
  sellerConfirmedAt: Date | null = null;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt: Date | null = null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hash: string | null = null;

  @Column({ name: 'signature_placeholder', type: 'varchar', length: 255, nullable: true })
  signaturePlaceholder: string | null = null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => require('../../accounts/entities/account.entity').Account)
  @JoinColumn({ name: 'buyer_id' })
  buyer!: Account;

  @ManyToOne(() => require('../../accounts/entities/account.entity').Account)
  @JoinColumn({ name: 'seller_id' })
  seller!: Account;
}
