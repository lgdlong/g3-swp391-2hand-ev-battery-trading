import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import type { Post } from '../../posts/entities/post.entity';
import { BikeStyle, Origin, VehicleColor } from '../../../shared/enums/vehicle.enum';

@Entity('post_ev_bike_details')
export class PostEvBikeDetails {
  @PrimaryColumn({ type: 'bigint' })
  post_id!: string;

  @OneToOne(
    () => require('../../posts/entities/post.entity').Post,
    (post: Post) => post.bikeDetails,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @Column({ type: 'int', nullable: true })
  brand_id: number | null = null;

  @Column({ type: 'int', nullable: true })
  model_id: number | null = null;

  @Column({ type: 'int', nullable: true })
  trim_id: number | null = null;

  @Column({ type: 'smallint', nullable: true })
  manufacture_year: number | null = null;

  @Column({ type: 'enum', enum: BikeStyle, nullable: true })
  bike_style: BikeStyle | null = null;

  @Column({ type: 'enum', enum: Origin, nullable: true })
  origin: Origin | null = null;

  @Column({ type: 'enum', enum: VehicleColor, nullable: true })
  color_id: VehicleColor | null = null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  license_plate: string | null = null;

  @Column({ type: 'smallint', nullable: true })
  owners_count: number | null = null;

  @Column({ type: 'int', nullable: true })
  odo_km: number | null = null;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  battery_capacity_kwh: number | null = null;

  @Column({ type: 'int', nullable: true })
  range_km: number | null = null;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  motor_power_kw: number | null = null;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  charge_ac_kw: number | null = null;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  battery_health_pct: number | null = null;
}
