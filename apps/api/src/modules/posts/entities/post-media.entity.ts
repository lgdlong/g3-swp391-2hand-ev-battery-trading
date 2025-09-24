import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import type { Post } from './post.entity';
import { MediaKind } from '../../../shared/enums/media.enum';

@Entity({ name: 'post_media' })
@Index(['post', 'position'])
export class PostMedia {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ManyToOne(() => require('./post.entity').Post, (post: Post) => post.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @Column({ type: 'enum', enum: MediaKind })
  kind!: MediaKind;

  @Column({ type: 'text' })
  url!: string;

  @Column({ type: 'int', default: 0 })
  position!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
