import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import type { BikeBrand } from './bike-brand.entity';

@Entity({ name: 'bike_models' })
@Index('UQ_bike_models_brand_name', ['brand', 'name'], { unique: true })
export class BikeModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(
    () => require('./bike-brand.entity').BikeBrand, // ✅ sync require
    (b: BikeBrand) => b.models,
    { onDelete: 'RESTRICT' },
  )
  @JoinColumn({ name: 'brand_id' })
  brand!: BikeBrand;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
