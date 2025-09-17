import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Post } from '../../../posts/entities/post.entity';

@Entity('post_battery_details')
export class PostBatteryDetail {
  @PrimaryColumn({ type: 'bigint' })
  post_id!: number;

  @OneToOne(() => Post, (post) => post.batteryDetail, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @Column({ type: 'varchar', length: 100 })
  brand!: string;

  @Column({ type: 'numeric', precision: 6, scale: 2 })
  capacity_kwh!: string;

  @Column({ type: 'int', nullable: true })
  cycles_used!: number | null;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  health_pct!: string | null;
}
