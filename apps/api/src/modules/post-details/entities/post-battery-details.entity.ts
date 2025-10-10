import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, ManyToOne, Index } from 'typeorm';
import { DecimalTransformer } from '../../../shared/transformers/decimal.transformer';
import { BatteryChemistry, OriginEnum } from '../../../shared/enums/battery.enum';
import type { BatteryBrand } from '../../catalogs/batteries/entities/battery-brand.entity';
import type { Post } from '../../posts/entities/post.entity';

@Entity('post_battery_details')
@Index(['brand'], { where: '"brand_id" IS NOT NULL' })
export class PostBatteryDetails {
  // 1–1 với posts.id
  @PrimaryColumn({ type: 'bigint', name: 'post_id' })
  postId!: string;

  // Quan hệ tới Post
  @OneToOne(
    () => require('../../posts/entities/post.entity').Post,
    (post: Post) => post.batteryDetails,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  // Thương hiệu (FK, optional)
  @ManyToOne(
    () => require('../../catalogs/batteries/entities/battery-brand.entity').BatteryBrand,
    (b: BatteryBrand) => b.batteryDetails,
    { nullable: true },
  )
  @JoinColumn({ name: 'brand_id' })
  brand?: BatteryBrand;

  // ========== Thông số kỹ thuật chính ==========
  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    name: 'voltage_v',
    nullable: true,
    transformer: new DecimalTransformer(),
    comment: 'Điện áp danh định (V)',
  })
  voltageV?: number | null;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    name: 'capacity_ah',
    nullable: true,
    transformer: new DecimalTransformer(),
    comment: 'Dung lượng (Ah)',
  })
  capacityAh?: number | null;

  @Column({
    type: 'decimal',
    precision: 4,
    scale: 1,
    name: 'charge_time_hours',
    nullable: true,
    transformer: new DecimalTransformer(),
    comment: 'Thời gian sạc đầy (giờ)',
  })
  chargeTimeHours?: number | null;

  // ========== Phân loại ==========
  @Column({
    type: 'enum',
    enum: BatteryChemistry,
    nullable: true,
    comment: 'Loại hoá học cell',
  })
  chemistry?: BatteryChemistry | null;

  @Column({
    type: 'enum',
    enum: OriginEnum,
    nullable: true,
    comment: 'Xuất xứ: NOI_DIA | NHAP_KHAU',
  })
  origin?: OriginEnum | null;

  // ========== Khác ==========
  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    name: 'weight_kg',
    nullable: true,
    transformer: new DecimalTransformer(),
    comment: 'Trọng lượng khối pin (kg)',
  })
  weightKg?: number | null;

  @Column({
    type: 'int',
    name: 'cycle_life',
    nullable: true,
    comment: 'Tuổi thọ chu kỳ sạc/xả (số chu kỳ)',
  })
  cycleLife?: number | null;

  @Column({
    type: 'int',
    name: 'range_km',
    nullable: true,
    comment: 'Quãng đường ước tính cho 1 lần sạc (km)',
  })
  rangeKm?: number | null;

  @Column({
    type: 'text',
    name: 'compatible_notes',
    nullable: true,
    comment: 'Ghi chú tương thích (xe, BMS, cell, kích thước...)',
  })
  compatibleNotes?: string | null;
}
