import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { CarModel } from './car-model.entity';

@Entity({ name: 'car_brands' })
export class CarBrand {
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
    () => require('./car-model.entity').CarModel, // ✅ sync require
    (m: CarModel) => m.brand,
  )
  models!: CarModel[];
}
