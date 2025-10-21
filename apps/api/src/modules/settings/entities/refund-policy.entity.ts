import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IsInt, IsNumber, Min } from 'class-validator';

@Entity('refund_policy')
export class RefundPolicy {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Column({ name: 'cancel_early_rate', type: 'decimal', precision: 5, scale: 4, nullable: true })
  cancelEarlyRate!: number | null;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Column({ name: 'expired_rate', type: 'decimal', precision: 5, scale: 4, nullable: true })
  expiredRate!: number | null;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Column({ name: 'fraud_suspected_rate', type: 'decimal', precision: 5, scale: 4, nullable: true })
  fraudSuspectedRate!: number | null;

  @IsInt()
  @Min(0)
  @Column({ name: 'hold_days', type: 'smallint', nullable: true })
  holdDays!: number | null;

  @IsInt()
  @Min(0)
  @Column({ name: 'auto_refund_after_days', type: 'smallint', nullable: true })
  autoRefundAfterDays!: number | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
