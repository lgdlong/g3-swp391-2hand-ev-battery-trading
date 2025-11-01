import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentOrder } from '../../payos/entities/payment-order.entity';
import { Account } from '../../accounts/entities/account.entity';
import { WalletTransaction } from '../../wallets/entities/wallet-transaction.entity';
import { RefundScenario } from '../../../shared/enums/refund-scenario.enum';
import { RefundStatus } from '../../../shared/enums/refund-status.enum';

@Entity('refunds')
export class Refund {
  /** ID tự tăng (PK) */
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  /** Liên kết tới PaymentOrder */
  @ManyToOne(() => PaymentOrder, { eager: false, nullable: false })
  @JoinColumn({ name: 'payment_order_id' })
  paymentOrder!: PaymentOrder;

  @IsInt()
  @Min(1)
  @Column({ name: 'payment_order_id', type: 'bigint' })
  paymentOrderId!: string;

  /** Người nhận tiền hoàn (FK → accounts.id) */
  @ManyToOne(() => Account, { eager: false, nullable: false })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @IsInt()
  @Min(1)
  @Column({ name: 'account_id', type: 'bigint' })
  accountId!: string;

  /** Loại tình huống refund (CANCEL_EARLY, EXPIRED, HIGH_INTERACTION, FRAUD_SUSPECTED) */
  @Column({ name: 'scenario', type: 'enum', enum: RefundScenario })
  scenario!: RefundScenario;

  /** Tỷ lệ hoàn tiền (%) snapshot tại thời điểm xử lý */
  @IsInt()
  @Min(0)
  @Column({ name: 'policy_rate_percent', type: 'smallint' })
  policyRatePercent!: number;

  /** Số tiền gốc của order (VND, nguyên) */
  @IsNumber()
  @Min(0)
  @Column({ name: 'amount_original', type: 'numeric', precision: 20, scale: 0 })
  amountOriginal!: string;

  /** Số tiền được hoàn thực tế (VND, nguyên) */
  @IsNumber()
  @Min(0)
  @Column({ name: 'amount_refund', type: 'numeric', precision: 20, scale: 0 })
  amountRefund!: string;

  /** Trạng thái refund (PENDING, REFUNDED, FAILED) */
  @Column({
    name: 'status',
    type: 'enum',
    enum: RefundStatus,
    default: RefundStatus.PENDING,
  })
  status!: RefundStatus;

  /** Lý do hoàn tiền (từ admin hoặc hệ thống) */
  @IsOptional()
  @IsString()
  @Column({ name: 'reason', type: 'varchar', length: 255, nullable: true })
  reason?: string | null;

  /** Ngày giữ tiền (nếu cần, optional cho fraud case) */
  @IsOptional()
  @Column({ name: 'held_until', type: 'timestamptz', nullable: true })
  heldUntil?: Date | null;

  /** Liên kết tới wallet_transactions nếu đã hoàn tiền vào ví */
  @ManyToOne(() => WalletTransaction, { eager: false, nullable: true })
  @JoinColumn({ name: 'wallet_transaction_id' })
  walletTransaction?: WalletTransaction | null;

  @IsOptional()
  @IsInt()
  @Column({ name: 'wallet_transaction_id', type: 'bigint', nullable: true })
  walletTransactionId?: string | null;

  /** Admin thực hiện refund (nếu có) */
  @ManyToOne(() => Account, { eager: false, nullable: true })
  @JoinColumn({ name: 'performed_by_admin_id' })
  performedByAdmin?: Account | null;

  @IsOptional()
  @IsInt()
  @Column({ name: 'performed_by_admin_id', type: 'bigint', nullable: true })
  performedByAdminId?: string | null;

  /** Thời điểm refund thành công */
  @IsOptional()
  @Column({ name: 'refunded_at', type: 'timestamptz', nullable: true })
  refundedAt?: Date | null;

  /** Thời điểm tạo bản ghi */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  /** Thời điểm cập nhật bản ghi */
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
