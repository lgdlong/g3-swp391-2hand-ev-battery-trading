import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import type { Post } from '../../posts/entities/post.entity';
import { BodyStyle, Origin, VehicleColor } from '../../../shared/enums/vehicle.enum';
import { SeatOption } from '../../../shared/constants';

@Entity('post_ev_car_details')
export class PostEvCarDetails {
  @PrimaryColumn({ type: 'bigint' })
  post_id!: string;

  @OneToOne(
    () => require('../../posts/entities/post.entity').Post,
    (post: Post) => post.carDetails,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @Column({ type: 'int', nullable: true })
  brand_id: number | null = null;

  @Column({ type: 'int', nullable: true })
  model_id: number | null = null;

  @Column({ type: 'smallint', nullable: true })
  manufacture_year: number | null = null;

  @Column({ type: 'enum', enum: BodyStyle, nullable: true })
  body_style: BodyStyle | null = null;

  @Column({ type: 'enum', enum: Origin, nullable: true })
  origin: Origin | null = null;

  @Column({ type: 'enum', enum: VehicleColor, nullable: true })
  color: VehicleColor | null = null;

  // 2 4 5 6 7 8 9 10 12 14 16
  @Column({ type: 'smallint', nullable: true })
  seats: SeatOption | null = null;

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
  charge_ac_kw: number | null = null;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  charge_dc_kw: number | null = null;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  battery_health_pct: number | null = null;

  @Column({ type: 'boolean', default: false })
  has_bundled_battery: boolean = false;
}
