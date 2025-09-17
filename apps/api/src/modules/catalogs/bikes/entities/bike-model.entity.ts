import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { BikeBrand } from './bike-brand.entity';
import { BikeTrim } from './bike-trim.entity';

@Entity({ name: 'bike_models' })
@Index('UQ_bike_models_brand_name', ['brand', 'name'], { unique: true })
export class BikeModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => BikeBrand, (b) => b.models, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'brand_id' })
  brand!: BikeBrand;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => BikeTrim, (t) => t.model)
  trims!: BikeTrim[];
}
