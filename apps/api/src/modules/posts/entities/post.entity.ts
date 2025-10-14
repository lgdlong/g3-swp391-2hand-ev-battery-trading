import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import type { Account } from '../../accounts/entities/account.entity';
import { PostStatus, PostType } from '../../../shared/enums/post.enum';
import type { PostEvCarDetails } from '../../post-details/entities/post-ev-car-details.entity';
import type { PostEvBikeDetails } from '../../post-details/entities/post-ev-bike-details.entity';
import type { PostBatteryDetails } from '../../post-details/entities/post-battery-details.entity';
import { PostImage } from './post-image.entity';

@Entity({ name: 'posts' })
@Index(['wardCode'])
@Index(['status', 'submittedAt'])
@Index(['seller', 'status'])
export class Post {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ManyToOne(
    () => require('../../accounts/entities/account.entity').Account,
    (account: Account) => account.posts,
    { nullable: false, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'seller_id' })
  seller!: Account;

  @Column({ type: 'enum', enum: PostType })
  postType!: PostType;

  @Column({ type: 'varchar', length: 120 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 10 })
  wardCode!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  provinceNameCached: string | null = null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  districtNameCached: string | null = null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  wardNameCached: string | null = null;

  @Column({ type: 'text', nullable: true })
  addressTextCached: string | null = null;

  @Column({ type: 'numeric', precision: 14, scale: 0 })
  priceVnd!: string;

  @Column({ type: 'boolean', default: false })
  isNegotiable!: boolean;

  @Column({ type: 'enum', enum: PostStatus, default: PostStatus.DRAFT })
  status!: PostStatus;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date | null = null;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date | null = null;

  @ManyToOne(() => require('./../../accounts/entities/account.entity').Account, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy: Account | null = null;

  @Column({ type: 'text', nullable: true })
  rejectReason: string | null = null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  // ---------------------------
  // One-to-one relations
  // ---------------------------

  @OneToOne(
    () => require('../../post-details/entities/post-ev-car-details.entity').PostEvCarDetails,
    (detail: PostEvCarDetails) => detail.post,
    { cascade: true },
  )
  carDetails?: PostEvCarDetails;

  @OneToOne(
    () => require('../../post-details/entities/post-ev-bike-details.entity').PostEvBikeDetails,
    (detail: PostEvBikeDetails) => detail.post,
    { cascade: true },
  )
  bikeDetails?: PostEvBikeDetails;

  @OneToOne(
    () => require('../../post-details/entities/post-battery-details.entity').PostBatteryDetails,
    (detail: PostBatteryDetails) => detail.post,
    { cascade: true },
  )
  batteryDetails?: PostBatteryDetails;

  // ---------------------------
  // One-to-many relations
  // ---------------------------

  @OneToMany(() => require('./post-image.entity').PostImage, (image: PostImage) => image.post)
  images!: PostImage[];
}
