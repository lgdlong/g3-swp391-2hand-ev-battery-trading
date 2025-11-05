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
import { Account } from '../../accounts/entities/account.entity';
import { WalletTransaction } from '../../wallets/entities/wallet-transaction.entity';
import { Post } from '../../posts/entities/post.entity';
import { RefundScenario } from '../../../shared/enums/refund-scenario.enum';
import { RefundStatus } from '../../../shared/enums/refund-status.enum';

/**
 * Refund entity - Tracking refunds cho post deposits
 * Auto refund bởi cron job
 */
@Entity('refunds')
export class Refund {
  /** ID tự tăng (PK) */
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  /** Liên kết tới Post (bài đăng được refund) */
  @ManyToOne(() => Post, { eager: false, nullable: false })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @IsString()
  @Column({ name: 'post_id', type: 'bigint' })
  postId!: string;

  /** Người nhận tiền hoàn (FK → accounts.id) */
  @ManyToOne(() => Account, { eager: false, nullable: false })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @IsInt()
  @Min(1)
  @Column({ name: 'account_id', type: 'int' })
  accountId!: number;

  /** Loại tình huống refund (CANCEL_EARLY, CANCEL_LATE, EXPIRED, FRAUD_SUSPECTED) */
  @Column({ name: 'scenario', type: 'enum', enum: RefundScenario })
  scenario!: RefundScenario;

  /** Tỷ lệ hoàn tiền (%) snapshot tại thời điểm xử lý */
  @IsInt()
  @Min(0)
  @Column({ name: 'policy_rate_percent', type: 'smallint' })
  policyRatePercent!: number;

  /** Số tiền gốc (deposit đã trả - VND) */
  @IsNumber()
  @Min(0)
  @Column({ name: 'amount_original', type: 'numeric', precision: 14, scale: 2 })
  amountOriginal!: string;

  /** Số tiền được hoàn thực tế (VND) */
  @IsNumber()
  @Min(0)
  @Column({ name: 'amount_refund', type: 'numeric', precision: 14, scale: 2 })
  amountRefund!: string;

  /** Trạng thái refund (PENDING, REFUNDED, FAILED, REJECTED) */
  @Column({
    name: 'status',
    type: 'enum',
    enum: RefundStatus,
    default: RefundStatus.PENDING,
  })
  status!: RefundStatus;

  /** Lý do hoàn tiền hoặc lỗi */
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
  @Column({ name: 'wallet_transaction_id', type: 'int', nullable: true })
  walletTransactionId?: number | null;

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
