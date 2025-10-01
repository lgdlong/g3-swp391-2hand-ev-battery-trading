import { Account } from "src/modules/accounts/entities/account.entity";
import { Post } from "src/modules/posts/entities/post.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";


@Entity('post_bookmarks')
@Unique(['postId', 'accountId'])
export class PostBookmark {
    @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'account_id', type: 'int' })
  accountId!: number;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })  // FK column snake_case
  account!: Account;

  @Column({ name: 'post_id', type: 'int' })
  postId!: number;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })     // FK column snake_case
  post!: Post;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
