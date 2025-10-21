# Post Rating Module Summary (NestJS + Swagger)
## author: chatgpt
## reviewer: thai
## 1. Overview

The **Post Rating Module** allows authenticated users to rate and comment on posts (EV listings, battery listings, etc.). It also provides endpoints to update, delete, and view ratings, along with pagination, sorting, and filtering support.

The implementation includes:

* **Entity**: `PostRatings` with relations to `Post` and `Account`.
* **DTOs**: `CreatePostRatingDto`, `UpdatePostRatingDto`, and `SafeAccountDto` for safe responses.
* **Mapper**: `PostRatingMapper` for returning clean, non-sensitive data.
* **Service**: `PostRatingService` handling logic for CRUD operations.
* **Controller**: `PostRatingController` exposing endpoints with Swagger documentation.

---

## 2. Entity Design

```ts
@Entity('post_ratings')
export class PostRatings {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ManyToOne(() => Post, (post) => post.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @ManyToOne(() => Account, (account) => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: Account;

  @Column({ type: 'int', name: 'rating' })
  rating!: number; // constrained 0–5

  @Column({ type: 'text', name: 'content', nullable: true })
  content!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date | null;
}
```

---

## 3. DTOs

### CreatePostRatingDto

```ts
export class CreatePostRatingDto {
  @IsInt()
  rating!: number;

  @IsString()
  @IsOptional()
  content?: string;
}
```

### UpdatePostRatingDto

```ts
export class UpdatePostRatingDto {
  @IsInt()
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  content?: string;
}
```

### SafeAccountDto

Used for safe responses, hiding sensitive fields like password.

```ts
export class SafeAccountDto {
  id!: number;
  email!: string | null;
  phone!: string | null;
  fullName!: string;
  avatarUrl!: string | null;
  status!: AccountStatus;
  role!: AccountRole;
  createdAt!: Date;
  updatedAt!: Date;
}
```

---

## 4. Mapper

### PostRatingMapper (`src/modules/post-ratings/mappers/post-rating.mapper.ts`)

```ts
import { PostRatings } from '../entities/post-ratings.entity';
import { AccountMapper } from 'src/modules/accounts/mappers/account.mapper';
import { SafeAccountDto } from 'src/modules/accounts/dto/safe-account.dto';

export interface SafePostRatingDto {
  id: string;
  postId: string | number;
  rating: number;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
  customer: SafeAccountDto | null;
}

export class PostRatingMapper {
  static toSafeDto(entity: PostRatings): SafePostRatingDto {
    return {
      id: entity.id,
      postId: (entity.post as any)?.id ?? null,
      rating: entity.rating,
      content: entity.content ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      customer: entity.customer ? AccountMapper.toSafeDto(entity.customer) : null,
    };
  }

  static toSafeDtoArray(entities: PostRatings[]): SafePostRatingDto[] {
    return entities.map((r) => PostRatingMapper.toSafeDto(r));
  }
}
```

---

## 5. Service

### PostRatingService (`src/modules/post-ratings/post-ratings.service.ts`)

```ts
@Injectable()
export class PostRatingService {
  constructor(
    @InjectRepository(PostRatings)
    private readonly postRatingsRepository: Repository<PostRatings>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  // Create a new rating
  async create(postId: string, customerId: number, dto: CreatePostRatingDto) {
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.postRatingsRepository.findOne({
      where: { post: { id: postId }, customer: { id: customerId } },
    });
    if (existing) throw new BadRequestException('You have already rated this post');

    const customer = await this.accountRepository.findOne({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    const rating = this.postRatingsRepository.create({ post, customer, ...dto });
    const saved = await this.postRatingsRepository.save(rating);

    saved.post = post;
    saved.customer = customer;
    return PostRatingMapper.toSafeDto(saved);
  }

  // List all ratings for a post (with pagination, filters, sorting)
  async findAll(postId: string, opts: { page: number; limit: number; rating?: number; sort?: string }) {
    const { page, limit, rating, sort } = opts;

    const qb = this.postRatingsRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.customer', 'customer')
      .leftJoin('r.post', 'post')
      .addSelect(['post.id'])
      .where('r.post_id = :postId', { postId });

    if (rating !== undefined) qb.andWhere('r.rating = :rating', { rating });

    if (sort === 'rating_desc') qb.orderBy('r.rating', 'DESC');
    else if (sort === 'rating_asc') qb.orderBy('r.rating', 'ASC');
    else qb.orderBy('r.createdAt', 'DESC');

    const [rows, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();

    return {
      items: PostRatingMapper.toSafeDtoArray(rows),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  // Find one rating by ID
  async findOne(id: string, currentUserId: number) {
    const review = await this.postRatingsRepository.findOne({
      where: { id },
      relations: ['post', 'customer'],
      withDeleted: true,
    });
    if (!review) throw new NotFoundException('Rating not found');

    if ((review as any).deletedAt && review.customer?.id !== currentUserId)
      throw new NotFoundException('Rating not found');

    return PostRatingMapper.toSafeDto(review);
  }

  // Update a rating
  async update(id: string, dto: UpdatePostRatingDto, userId: number) {
    const rating = await this.postRatingsRepository.findOne({ where: { id }, relations: ['customer'] });
    if (!rating) throw new NotFoundException('Rating not found');
    if (rating.customer.id !== userId) throw new ForbiddenException('You cannot edit others’ rating');

    if (dto.rating !== undefined) rating.rating = dto.rating;
    if (dto.content !== undefined) rating.content = dto.content;

    const saved = await this.postRatingsRepository.save(rating);
    return PostRatingMapper.toSafeDto(saved);
  }

  // Soft delete a rating
  async remove(id: string, userId: number) {
    const rating = await this.postRatingsRepository.findOne({ where: { id }, relations: ['customer'] });
    if (!rating) throw new NotFoundException('Rating not found');
    if (rating.customer.id !== userId) throw new ForbiddenException('You cannot delete others’ rating');

    await this.postRatingsRepository.softRemove(rating);
    return { message: 'Deleted successfully' };
  }
}
```

---

## 6. Controller

### PostRatingController (with Swagger)

```ts
@ApiTags('rating')
@Controller('rating')
export class PostRatingController {
  constructor(private readonly postRatingService: PostRatingService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('/post/:id')
  @ApiOperation({ summary: 'Create a rating for a post' })
  @ApiParam({ name: 'id', type: String, description: 'Post ID' })
  @ApiCreatedResponse({ description: 'Rating created successfully' })
  create(@Param('id') postId: string, @Body() dto: CreatePostRatingDto, @CurrentUser() user: ReqUser) {
    return this.postRatingService.create(postId, user.sub, dto);
  }

  @Get('/post/:id')
  @ApiOperation({ summary: 'Get paginated list of ratings for a post' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'rating', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'rating_desc', 'rating_asc'] })
  findAll(
    @Param('id') postId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('rating') rating?: number,
    @Query('sort') sort: 'newest' | 'rating_desc' | 'rating_asc' = 'newest',
  ) {
    return this.postRatingService.findAll(postId, { page, limit, rating, sort });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single rating by ID'
```
