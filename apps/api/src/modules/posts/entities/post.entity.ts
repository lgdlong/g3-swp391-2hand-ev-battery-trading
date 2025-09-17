// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
// import { Account } from '../../accounts/entities/account.entity';
// // import { PostEvDetail } from './post-ev-detail.entity';
// import { PostBatteryDetail } from '../../post-details/battery/entities/post-battery-detail.entity';
//
// @Entity('posts')
// export class Post {
//   @PrimaryGeneratedColumn('increment', { type: 'bigint' })
//   id!: number;
//
//   @ManyToOne(() => Account, (account) => account.posts)
//   @JoinColumn({ name: 'seller_id' })
//   seller!: Account;
//
//   @Column({ type: 'varchar', length: 120 })
//   title!: string;
//
//   @Column({ type: 'text' })
//   description!: string;
//
//   @Column({ type: 'varchar', length: 10 })
//   ward_code!: string;
//
//   @Column({ type: 'varchar', length: 120, nullable: true })
//   province_name_cached!: string | null;
//
//   @Column({ type: 'varchar', length: 120, nullable: true })
//   district_name_cached!: string | null;
//
//   @Column({ type: 'varchar', length: 120, nullable: true })
//   ward_name_cached!: string | null;
//
//   @Column({ type: 'text', nullable: true })
//   address_text_cached!: string | null;
//
//   @Column({ type: 'numeric', precision: 14, scale: 0 })
//   price_vnd!: string;
//
//   @Column({ type: 'boolean', default: false })
//   is_negotiable!: boolean;
//
//   @Column({ type: 'varchar', default: 'DRAFT' })
//   status!: string;
//
//   @OneToOne(() => PostEvDetail, (ev) => ev.post)
//   evDetail!: PostEvDetail;
//
//   @OneToOne(() => PostBatteryDetail, (battery) => battery.post)
//   batteryDetail!: PostBatteryDetail;
// }
