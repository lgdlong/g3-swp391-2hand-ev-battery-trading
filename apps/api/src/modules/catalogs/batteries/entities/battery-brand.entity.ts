import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import type { PostBatteryDetails } from '../../../post-details/entities/post-battery-details.entity';

@Entity({ name: 'battery_brands' })
export class BatteryBrand {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index({ unique: true })
  name!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(
    () => require('../../../post-details/entities/post-battery-details.entity').PostBatteryDetails,
    (d: PostBatteryDetails) => d.brand,
  )
  batteryDetails!: PostBatteryDetails[];
}
