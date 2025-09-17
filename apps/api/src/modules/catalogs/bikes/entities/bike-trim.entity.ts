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
import { BikeModel } from './bike-model.entity';

@Entity({ name: 'bike_trims' })
@Index('UQ_bike_trims_model_name', ['model', 'name'], { unique: true })
export class BikeTrim {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => BikeModel, (m) => m.trims, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'model_id' })
  model!: BikeModel;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
