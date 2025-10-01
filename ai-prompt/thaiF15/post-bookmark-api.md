# Trao đổi về Bookmark trong DB

**Prompt của bạn:**

> hình như đâu cần đúng k ? vì account - post đâu giữ id bookmark làm gì

**Trả lời:**

Đúng rồi — không bắt buộc phải thêm mối quan hệ ngược (@OneToMany) bên Account hay Post.  
Vì account/post đâu cần giữ bookmarkId. Bạn có 3 mức chọn:

---

### 1) Tối giản, có ràng buộc FK nhưng không thêm gì vào Account/Post
Khai báo FK ngay trong PostBookmark. DB vẫn enforce FK, nhưng Account/Post không có mảng bookmarks.

```ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { Post } from '../../posts/entities/post.entity';

@Entity('post_bookmarks')
@Unique(['accountId', 'postId'])
@Index('idx_post_bookmarks_account', ['accountId'])
@Index('idx_post_bookmarks_post', ['postId'])
export class PostBookmark {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  accountId!: number;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  account!: Account; // không cần thêm OneToMany bên Account

  @Column()
  postId!: number;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post!: Post; // không cần thêm OneToMany bên Post

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

// Service tạo bookmark
async create(accountId: number, postId: number) {
  return this.repo.save(this.repo.create({ accountId, postId }));
}
```

**Ưu:** có foreign key thật ở DB, không phải sửa Account/Post.  
**Nhược:** từ Account muốn lấy bookmarks thì query qua repo PostBookmark (không thể `.relations: ['bookmarks']` từ Account).

---

### 2) Cực tối giản, không dùng FK (chỉ cột số)

Giữ mỗi accountId, postId là `@Column()` thường. Dễ nhất nhưng DB không ràng buộc, có thể chèn rác (orphan).

---

### 3) Đầy đủ 2 chiều

Thêm `@OneToMany` trong Account/Post nếu bạn muốn truy cập `account.bookmarks` / `post.bookmarks`. Không cần trong bài toán của bạn thì bỏ qua.

---

## Kết luận
Bạn chỉ cần phương án (1): FK ở PostBookmark là đủ chuẩn và sạch.  
Không cần bookmarks mảng trong Account/Post nếu bạn không dùng tới.
