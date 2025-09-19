import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { BikeModel } from './bike-model.entity';

@Entity({ name: 'bike_brands' })
export class BikeBrand {
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
    () => require('./bike-model.entity').BikeModel, // ✅ sync require
    (m: BikeModel) => m.brand,
  )
  models!: BikeModel[];
}
