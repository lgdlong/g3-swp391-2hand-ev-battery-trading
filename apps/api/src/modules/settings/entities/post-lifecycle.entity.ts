import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IsInt, Min } from 'class-validator';

@Entity('post_lifecycle')
export class PostLifecycle {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number;

  @IsInt()
  @Min(0)
  @Column({ name: 'expiration_days', type: 'smallint', nullable: true })
  expirationDays!: number | null;

  @Column({ name: 'auto_approve', type: 'boolean', nullable: true })
  autoApprove!: boolean | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
