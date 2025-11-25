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
import { PostDocumentType } from '../../../shared/enums/post-document-type.enum';

@Entity({ name: 'post_documents' })
@Index(['post_id', 'documentType'])
export class PostDocument {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'bigint' })
  post_id!: string;

  @ManyToOne(() => require('./post.entity').Post, (post: Post) => post.documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @Column({ type: 'enum', enum: PostDocumentType, default: PostDocumentType.VEHICLE_PAPER })
  documentType!: PostDocumentType;

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

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  created_at!: Date;
}

