import { AccountStatus } from '../../../shared/enums/account-status.enum';
import { AccountRole } from '../../../shared/enums/account-role.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Check,
  OneToMany,
} from 'typeorm';
import type { Post } from '../../posts/entities/post.entity';

@Check(`("email" IS NOT NULL OR "phone" IS NOT NULL)`)
@Entity({ name: 'accounts' })
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 120, unique: true, nullable: true })
  email: string | null = null;

  @Column({ type: 'varchar', length: 15, unique: true, nullable: true })
  phone: string | null = null;

  @Column({ name: 'password_hashed', type: 'varchar', length: 255 })
  passwordHashed!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 120 })
  fullName!: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null = null;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  status!: AccountStatus;

  @Column({
    type: 'enum',
    enum: AccountRole,
    default: AccountRole.USER,
  })
  role!: AccountRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => require('./../../posts/entities/post.entity').Post, (post: Post) => post.seller)
  posts!: Post[];
}
