# Backend API Missing Endpoint - CRITICAL

## Issue Description
⚠️ **The `/posts/my` endpoint DOES NOT EXIST in the backend!**

The frontend is calling `GET /posts/my` but this endpoint is not implemented in `posts.controller.ts`.

## Error Details
```
QueryFailedError: invalid input syntax for type bigint: "my"
```

This occurs because:
1. The `/posts/my` route is **not defined** in the controller
2. The request falls through to `/posts/:id` 
3. NestJS treats "my" as the post ID parameter
4. TypeORM tries to parse "my" as a bigint (post ID)
5. PostgreSQL rejects it with "invalid input syntax for type bigint"

## Required Fix (Backend)

**Step 1:** Add the `/posts/my` endpoint in `posts.controller.ts`

**Step 2:** Place it **BEFORE** the `/posts/:id` route

### Current State (MISSING ENDPOINT)
```typescript
@Controller('posts')
export class PostsController {
  // ❌ /posts/my endpoint does NOT exist!
  
  @Get(':id')  // This catches /posts/my and treats "my" as ID
  getPostById(@Param('id') id: string) { ... }
}
```

### Required Implementation
```typescript
@Controller('posts')
export class PostsController {
  // ✅ ADD THIS ENDPOINT (before :id route)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my')
  @ApiOperation({ summary: 'Get posts for current logged-in user' })
  @ApiOkResponse({ 
    description: 'Paginated list of user posts',
    type: PaginatedBasePostResponseDto 
  })
  async getMyPosts(
    @User() user: AuthUser,
    @Query() query: ListQueryDto,
  ): Promise<PaginatedBasePostResponseDto> {
    return this.postsService.getPostsByUserId(user.sub, query);
  }
  
  @Get(':id')  // ✅ Keep this AFTER the /my route
  async getPostById(@Param('id') id: string) { ... }
}
```

### Service Method (Also needs to be added)
```typescript
// In posts.service.ts
async getPostsByUserId(
  userId: number, 
  query: ListQueryDto
): Promise<PaginatedBasePostResponseDto> {
  const { limit = 10, page = 1, status, q } = query;
  const offset = (page - 1) * limit;

  const queryBuilder = this.postRepository
    .createQueryBuilder('post')
    .leftJoinAndSelect('post.seller', 'seller')
    .leftJoinAndSelect('post.carDetails', 'carDetails')
    .leftJoinAndSelect('post.bikeDetails', 'bikeDetails')
    .leftJoinAndSelect('post.batteryDetails', 'batteryDetails')
    .leftJoinAndSelect('post.images', 'images')
    .where('post.sellerId = :userId', { userId })
    .orderBy('post.createdAt', 'DESC');

  if (status) {
    queryBuilder.andWhere('post.status = :status', { status });
  }

  if (q) {
    queryBuilder.andWhere(
      '(post.title ILIKE :search OR post.description ILIKE :search)',
      { search: `%${q}%` }
    );
  }

  const [posts, total] = await queryBuilder
    .skip(offset)
    .take(limit)
    .getManyAndCount();

  return {
    data: posts.map(post => this.mapToBasePostResponse(post)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
```

## Route Ordering Rules in NestJS

1. **Specific routes BEFORE dynamic routes**
   - `/posts/my` before `/posts/:id`
   - `/posts/admin/all` before `/posts/:id`
   
2. **More specific paths take precedence**
   - `/posts/bike/search` before `/posts/bike/:id`
   
3. **Static segments are matched first**
   - Paths with literal strings are prioritized over parameter placeholders

## Other Affected Routes (Please Check)

Make sure these routes are also ordered correctly:
- `/posts/my` ✅
- `/posts/search` 
- `/posts/count`
- `/posts/admin/all`
- `/posts/:id/submit`
- `/posts/:id/approve`
- `/posts/:id/reject`
- `/posts/:id` ← Should be LAST among GET routes

## Frontend Workaround (Temporary)

The frontend has been updated with:
1. Authentication checks before API calls
2. Better error handling and user feedback
3. Retry mechanism
4. Redirect to login if authentication fails

But this **does NOT fix the root cause** - the backend routing must be corrected.

## Priority: HIGH
This blocks users from viewing their posts on the frontend.

## Testing After Fix

1. Login as a user
2. Navigate to "My Posts" page
3. Verify posts load correctly
4. Test filtering by status (PENDING_REVIEW, PUBLISHED, REJECTED, SOLD)
5. Test pagination

## Backend Files to Check

- `apps/api/src/modules/post/post.controller.ts`
- Any decorators using `@Get()` with 'my' or dynamic parameters

---
**Created:** October 13, 2025
**Reporter:** Frontend Team
**Status:** ⚠️ BLOCKING - Requires immediate backend fix
