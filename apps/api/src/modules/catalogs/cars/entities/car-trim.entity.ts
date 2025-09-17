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
import type { CarModel } from './car-model.entity';

@Entity({ name: 'car_trims' })
@Index('UQ_car_trims_model_name', ['model', 'name'], { unique: true })
export class CarTrim {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(
    () => require('./car-model.entity').CarModel, // ✅ sync require
    (m: CarModel) => m.trims,
    { onDelete: 'RESTRICT' },
  )
  @JoinColumn({ name: 'model_id' })
  model!: CarModel;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
