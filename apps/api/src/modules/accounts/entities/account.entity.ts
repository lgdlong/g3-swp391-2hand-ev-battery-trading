// apps/api/src/modules/accounts/entities/account.entity.ts
import { AccountStatus } from '../../../shared/enums/account-status.enum';
import { AccountRole } from '../../../shared/enums/account-role.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Check,
} from 'typeorm';

@Check(`("email" IS NOT NULL OR "phone" IS NOT NULL)`)
@Entity({ name: 'accounts' })
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 120, unique: true, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 10, unique: true, nullable: true })
  phone!: string | null;

  @Column({ name: 'password_hashed', type: 'varchar', length: 255 })
  passwordHashed!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 120 })
  fullName!: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl!: string | null;

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
}
