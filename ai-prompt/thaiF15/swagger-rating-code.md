# Swagger Documentation Code for Post Ratings Module
## athor by ai agent claude 
## reviewer:  thai


## 1. Controller Code (`post-ratings.controller.ts`)

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PostRatingService } from './post-ratings.service';
import { CreatePostRatingDto } from './dto/create-post-rating.dto';
import { UpdatePostRatingDto } from './dto/update-post-rating.dto';
import { PostRatingResponseDto, PostRatingListResponseDto } from './dto/post-rating-response.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import type { ReqUser } from 'src/core/decorators/current-user.decorator';

@ApiTags('Post Ratings')
@Controller('rating')
export class PostRatingController {
  constructor(private readonly postRatingService: PostRatingService) { }

  @ApiOperation({ summary: 'Create a rating for a post' })
  @ApiParam({ name: 'id', description: 'Post ID', example: '123' })
  @ApiResponse({ status: 201, description: 'Rating created successfully', type: PostRatingResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/post/:id')
  create(
    @Param('id') postId: string,
    @Body() createPostRatingDto: CreatePostRatingDto,
    @CurrentUser() user: ReqUser,
  ) {
    return this.postRatingService.create(postId, user.sub, createPostRatingDto);
  }

  @ApiOperation({ summary: 'Get all ratings for a post with pagination and filters' })
  @ApiParam({ name: 'id', description: 'Post ID', example: '123' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  @ApiQuery({ name: 'rating', required: false, description: 'Filter by rating (0-5)', example: 5 })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort order', enum: ['newest', 'rating_desc', 'rating_asc'], example: 'newest' })
  @ApiResponse({ status: 200, description: 'Ratings retrieved successfully', type: PostRatingListResponseDto })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @Get('/post/:id')
  findAll(
    @Param('id') postId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('rating') rating?: number,
    @Query('sort') sort: 'newest' | 'rating_desc' | 'rating_asc' = 'newest',
  ) {
    return this.postRatingService.findAll(postId, {
      page,
      limit,
      rating,
      sort,
    });
  }

  @ApiOperation({ summary: 'Get a specific rating by ID' })
  @ApiParam({ name: 'id', description: 'Rating ID', example: '123' })
  @ApiResponse({ status: 200, description: 'Rating retrieved successfully', type: PostRatingResponseDto })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: ReqUser) {
    const currentUserId = user.sub;
    const review = await this.postRatingService.findOne(id, currentUserId);
    if (!review) throw new NotFoundException('Rating not found');
    return review;
  }

  // @UseGuards(JwtAuthGuard)
  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updatePostRatingDto: UpdatePostRatingDto,
  //   @CurrentUser() user: ReqUser) {
  //   return this.postRatingService.update(id, updatePostRatingDto, user.sub);
  // }

  @ApiOperation({ summary: 'Delete a rating by ID' })
  @ApiParam({ name: 'id', description: 'Rating ID', example: '123' })
  @ApiResponse({ status: 200, description: 'Rating deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the owner of this rating' })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  removeById(
    @Param('id') id: string,
    @CurrentUser() user: ReqUser
) {
    return this.postRatingService.removeById(id, user.sub);
  }

  @ApiOperation({ summary: 'Delete user\'s rating for a specific post' })
  @ApiParam({ name: 'id', description: 'Post ID', example: '123' })
  @ApiResponse({ status: 200, description: 'Rating deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 404, description: 'Rating not found for this post and user' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/post/:id')
  removeByPostId(
    @Param('id') id: string,
    @CurrentUser() user: ReqUser
) {
    return this.postRatingService.removeByPostId(id, user.sub);
  }
}
```

## 2. Create DTO Code (`create-post-rating.dto.ts`)

```typescript
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePostRatingDto {
    @ApiProperty({
        description: 'Rating score for the post',
        minimum: 0,
        maximum: 5,
        example: 4,
        type: 'integer'
    })
    @IsInt()
    @Min(0)
    @Max(5)
    rating!: number;

    @ApiPropertyOptional({
        description: 'Optional review content/comment',
        maxLength: 1000,
        example: 'Great battery condition, exactly as described!'
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    content!: string;
}
```

## 3. Update DTO Code (`update-post-rating.dto.ts`)

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreatePostRatingDto } from './create-post-rating.dto';

export class UpdatePostRatingDto extends PartialType(CreatePostRatingDto) {}
```

## 4. Response DTO Code (`post-rating-response.dto.ts`) - NEW FILE

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PostRatingResponseDto {
    @ApiProperty({
        description: 'Rating ID',
        example: '123'
    })
    id!: string;

    @ApiProperty({
        description: 'Rating score',
        minimum: 0,
        maximum: 5,
        example: 4
    })
    rating!: number;

    @ApiPropertyOptional({
        description: 'Review content',
        example: 'Great battery condition, exactly as described!'
    })
    content?: string;

    @ApiProperty({
        description: 'Post ID that was rated',
        example: '456'
    })
    postId!: string;

    @ApiProperty({
        description: 'User ID who created the rating',
        example: '789'
    })
    userId!: number;

    @ApiProperty({
        description: 'Rating creation date',
        example: '2024-01-15T10:30:00Z'
    })
    createdAt!: Date;

    @ApiProperty({
        description: 'Rating last update date',
        example: '2024-01-15T10:30:00Z'
    })
    updatedAt!: Date;
}

export class PostRatingListResponseDto {
    @ApiProperty({
        type: [PostRatingResponseDto],
        description: 'List of ratings'
    })
    data!: PostRatingResponseDto[];

    @ApiProperty({
        description: 'Total number of ratings',
        example: 150
    })
    total!: number;

    @ApiProperty({
        description: 'Current page number',
        example: 1
    })
    page!: number;

    @ApiProperty({
        description: 'Items per page',
        example: 20
    })
    limit!: number;

    @ApiProperty({
        description: 'Total number of pages',
        example: 8
    })
    totalPages!: number;
}
```

## Summary of Changes

### 🔧 What was modified:
1. **Controller**: Added complete Swagger documentation for all endpoints
2. **Create DTO**: Added `@ApiProperty` and `@ApiPropertyOptional` decorators
3. **Update DTO**: Changed import from `@nestjs/mapped-types` to `@nestjs/swagger`
4. **Response DTOs**: Created new file with response type definitions

### 🚀 New Features in Swagger UI:
- ✅ **API Tags**: All endpoints grouped under "Post Ratings"
- ✅ **Operation Descriptions**: Clear summary for each endpoint
- ✅ **Parameter Documentation**: Path params, query params with examples
- ✅ **Response Schemas**: Proper response type definitions
- ✅ **Authentication**: Bearer token requirements clearly marked
- ✅ **Error Responses**: All possible HTTP status codes documented
- ✅ **Request Body Schema**: Input validation and examples
- ✅ **Pagination Support**: Query parameters for filtering and sorting

### 📋 API Endpoints Documented:
1. `POST /rating/post/:id` - Create rating (Auth required)
2. `GET /rating/post/:id` - Get ratings with pagination/filters
3. `GET /rating/:id` - Get single rating
4. `DELETE /rating/:id` - Delete rating by ID (Auth required)
5. `DELETE /rating/post/:id` - Delete user's rating for post (Auth required)