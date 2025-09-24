import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import type { Post } from '../../posts/entities/post.entity';

@Entity('post_battery_details')
export class PostBatteryDetails {
  @PrimaryColumn({ type: 'bigint' })
  post_id!: string;

  @OneToOne(
    () => require('../../posts/entities/post.entity').Post,
    (post: Post) => post.batteryDetails,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand: string | null = null;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  capacity_kwh: number | null = null;

  @Column({ type: 'int', nullable: true })
  cycles_used: number | null = null;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  health_pct: number | null = null;
}
