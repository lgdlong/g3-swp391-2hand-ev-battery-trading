import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';

@Entity('post_images')
@Index(['post_id', 'position'])
export class PostImage {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'bigint' })
  post_id!: string;

  @ManyToOne(() => require('./post.entity').Post, (post: Post) => post.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @Column({ type: 'varchar', length: 255, unique: true })
  public_id!: string;

  @Column({ type: 'text' })
  url!: string;

  @Column({ type: 'int' })
  width!: number;

  @Column({ type: 'int' })
  height!: number;

  @Column({ type: 'int' })
  bytes!: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  format: string | null = null;

  @Column({ type: 'int', default: 0 })
  position!: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;
}
