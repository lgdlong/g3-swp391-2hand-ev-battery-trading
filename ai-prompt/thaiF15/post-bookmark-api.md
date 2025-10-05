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
=======================================================================
# Tóm tắt về `post_bookmarks`

## Yêu cầu từ bạn (prompt)

* Muốn xây dựng hệ thống **bookmark** trong NestJS + PostgreSQL.
* Bookmark chỉ là **cầu nối** giữa `accountId` và `postId`, không có note/tag gì thêm.
* Thắc mắc về:

  * Controller viết thế nào cho create.
  * Service tối giản.
  * Entity nên khai báo ra sao.
  * Tại sao database lưu camelCase thay vì snake_case.
  * Có cần quan hệ 2 chiều với `Account` và `Post` không.
  * Có cần Update DTO không.
* Muốn cuối cùng được một flow rõ ràng: Controller → Service → Entity (DB).

---

## Giải thích & Trả lời của mình

### 1. Entity (DB Layer)

* Định nghĩa bảng `post_bookmarks` với các field:

  * `id SERIAL PRIMARY KEY`
  * `account_id INT NOT NULL`
  * `post_id INT NOT NULL`
  * `created_at TIMESTAMPTZ DEFAULT now()`
* Có unique constraint `(account_id, post_id)` để một user chỉ bookmark một post một lần.
* Có thể thêm quan hệ ManyToOne tới `Account` và `Post` (chỉ cần 1 chiều).
* Snake case cột:

  * Cách 1: thêm `name: 'account_id'` vào `@Column`.
  * Cách 2: dùng `SnakeNamingStrategy` toàn dự án.

```ts
@Entity('post_bookmarks')
@Unique(['accountId', 'postId'])
export class PostBookmark {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'account_id' })
  accountId!: number;

  @Column({ name: 'post_id' })
  postId!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post!: Post;
}
```

### 2. Service (Business Layer)

* Tối giản: chỉ tạo record mới.
* Nếu trùng thì DB ném lỗi (23505) → có thể catch và trả về 409.

```ts
@Injectable()
export class PostBookmarksService {
  constructor(
    @InjectRepository(PostBookmark)
    private readonly repo: Repository<PostBookmark>,
  ) {}

  async create(accountId: number, postId: number) {
    const bookmark = this.repo.create({ accountId, postId });
    return this.repo.save(bookmark);
  }
}
```

### 3. Controller (API Layer)

* Nhận `accountId` từ JWT (`@CurrentUser('id')`).
* Nhận `postId` từ body.
* Nên dùng DTO hoặc `ParseIntPipe`.

```ts
class CreatePostBookmarkDto {
  @IsInt()
  @Type(() => Number)
  postId!: number;
}

@Controller('post-bookmarks')
@UseGuards(JwtAuthGuard)
export class PostBookmarksController {
  constructor(private readonly service: PostBookmarksService) {}

  @Post()
  async create(
    @CurrentUser('id') accountId: number,
    @Body() dto: CreatePostBookmarkDto,
  ) {
    return this.service.create(accountId, dto.postId);
  }
}
```

### 4. Update DTO

* Không cần thiết vì bookmark là cầu nối.
* Chỉ cần `create` và `delete` (hoặc `toggle`).
* File `update-post_bookmark.dto.ts` sinh ra từ Nest CLI có thể xoá.

---

## Kết luận

* `post_bookmarks` chỉ cần **Entity + Service + Controller cho create**.
* Snake_case có thể ép bằng `name` hoặc NamingStrategy.
* Không cần giữ quan hệ ngược bên `Account`/`Post` nếu không dùng.
* Không cần Update DTO.
* API gọi: `POST /post-bookmarks` với body `{ "postId": 42 }`, kèm JWT → tạo bookmark (account lấy từ token).
