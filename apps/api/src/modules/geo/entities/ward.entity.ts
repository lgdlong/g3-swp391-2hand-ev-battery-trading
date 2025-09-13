import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { District } from './district.entity';

@Entity('wards')
export class Ward {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  code!: string;

  @Column()
  name!: string;

  @ManyToOne(() => District, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'district_id' })
  district!: District;

  @Column()
  district_id!: number;
}
