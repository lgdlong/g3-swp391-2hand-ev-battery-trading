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
import type { CarBrand } from './car-brand.entity';

@Entity({ name: 'car_models' })
@Index('UQ_car_models_brand_name', ['brand', 'name'], { unique: true })
export class CarModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(
    () => require('./car-brand.entity').CarBrand, // ✅ sync require
    (b: CarBrand) => b.models,
    { onDelete: 'RESTRICT' },
  )
  @JoinColumn({ name: 'brand_id' })
  brand!: CarBrand;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
