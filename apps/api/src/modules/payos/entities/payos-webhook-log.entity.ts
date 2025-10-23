import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import type { PaymentOrder } from './payment-order.entity';
import { WebhookProcessingStatus } from '../../../shared/enums/webhook-processing-status.enum';

@Entity({ name: 'payos_webhook_logs' })
@Index(['orderCode'])
@Index(['processingStatus', 'receivedAt'])
export class PayosWebhookLog {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'jsonb', nullable: false })
  payload!: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: false })
  signature!: string;

  @Column({ name: 'is_signature_valid', type: 'boolean', nullable: false })
  isSignatureValid!: boolean;

  @Column({ name: 'order_code', type: 'bigint', nullable: false })
  orderCode!: string;

  @Column({ name: 'payment_link_id', type: 'varchar', length: 100, nullable: true })
  paymentLinkId: string | null = null;

  @Column({ name: 'transaction_ref', type: 'varchar', length: 100, nullable: true })
  transactionRef: string | null = null;

  @Column({ name: 'transaction_status', type: 'varchar', length: 10, nullable: true })
  transactionStatus: string | null = null;

  @Column({ type: 'decimal', precision: 14, scale: 0, nullable: true })
  amount: string | null = null;

  @Column({
    name: 'processing_status',
    type: 'enum',
    enum: WebhookProcessingStatus,
    default: WebhookProcessingStatus.RECEIVED,
  })
  processingStatus!: WebhookProcessingStatus;

  @Column({ name: 'processing_notes', type: 'text', nullable: true })
  processingNotes: string | null = null;

  @Column({ name: 'transaction_time', type: 'timestamp', nullable: false })
  transactionTime!: Date;

  @CreateDateColumn({ name: 'received_at' })
  receivedAt!: Date;

  // Relations
  @ManyToOne(() => require('./payment-order.entity').PaymentOrder)
  @JoinColumn({ name: 'order_code' })
  paymentOrder!: PaymentOrder;
}
