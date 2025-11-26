import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';
import type { Account } from '../../accounts/entities/account.entity';
import { PostVerificationDocumentType } from '../../../shared/enums/post-verification-document-type.enum';

/**
 * Bảng lưu giấy tờ xe phục vụ kiểm duyệt (cà vẹt, đăng ký, bảo hiểm...)
 * Các giấy tờ này CHỈ admin xem được, không hiển thị công khai
 */
@Entity({ name: 'post_verification_documents' })
@Index(['post_id', 'type'])
@Index(['uploaded_by'])
export class PostVerificationDocument {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'bigint' })
  post_id!: string;

  @ManyToOne(() => require('./post.entity').Post, (post: Post) => post.verificationDocuments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @Column({
    type: 'enum',
    enum: PostVerificationDocumentType,
    default: PostVerificationDocumentType.OTHER,
  })
  type!: PostVerificationDocumentType;

  @Column({ type: 'text' })
  url!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploaded_at!: Date;

  @Column({ type: 'int' })
  uploaded_by!: number;

  @ManyToOne(() => require('../../accounts/entities/account.entity').Account, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'uploaded_by' })
  uploader!: Account;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deleted_at?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at!: Date;
}

