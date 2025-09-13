import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('provinces')
export class Province {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  code!: string;

  @Column()
  name!: string;
}
