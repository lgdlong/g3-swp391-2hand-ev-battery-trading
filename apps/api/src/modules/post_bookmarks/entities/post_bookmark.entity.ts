import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";


@Entity('post_bookmarks')
@Unique(['postId', 'accountId'])
export class PostBookmark {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  accountId!: number;

  @Column()
  postId!: number;


  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}
