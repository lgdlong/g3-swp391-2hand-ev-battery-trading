import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IsInt, IsNumber, Min } from 'class-validator';

@Entity('refund_policy')
export class RefundPolicy {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number;

  /** Tỷ lệ hoàn tiền khi hủy sớm < 7 ngày: 100% (1.0000) */
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Column({ name: 'cancel_early_rate', type: 'decimal', precision: 5, scale: 4, nullable: true })
  cancelEarlyRate!: number | null;

  /** Tỷ lệ hoàn tiền khi hủy trễ 7-30 ngày: 70% (0.7000) */
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Column({ name: 'cancel_late_rate', type: 'decimal', precision: 5, scale: 4, nullable: true })
  cancelLateRate!: number | null;

  /** Tỷ lệ hoàn tiền khi hết hạn > 30 ngày: 50% (0.5000) */
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Column({ name: 'expired_rate', type: 'decimal', precision: 5, scale: 4, nullable: true })
  expiredRate!: number | null;

  /** Tỷ lệ hoàn tiền khi gian lận: 0% (0.0000) */
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Column({ name: 'fraud_suspected_rate', type: 'decimal', precision: 5, scale: 4, nullable: true })
  fraudSuspectedRate!: number | null;

  /** Số ngày giữ tiền khi gian lận (3-5 ngày) */
  @IsInt()
  @Min(0)
  @Column({ name: 'hold_days', type: 'smallint', nullable: true })
  holdDays!: number | null;

  /** Số ngày tự động refund cho posts hết hạn */
  @IsInt()
  @Min(0)
  @Column({ name: 'auto_refund_after_days', type: 'smallint', nullable: true })
  autoRefundAfterDays!: number | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
