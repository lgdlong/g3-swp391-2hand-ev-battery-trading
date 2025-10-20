import { Post } from 'src/modules/posts/entities/post.entity';
import { Account } from 'src/modules/accounts/entities/account.entity';
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IsIn, IsInt, IsString, Max, Min } from 'class-validator';


@Entity('post_ratings')
export class PostRatings {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ManyToOne(() => Post, (post) => post.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @ManyToOne(() => Account, (account) => account.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer!: Account;

  @Min(0)
  @Max(5)
  @Column({ name: 'rating', type: 'int' })
  rating!: number;

  @Column({ name: 'content', type: 'text', nullable: true })
  content!: string | null;


  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

}
