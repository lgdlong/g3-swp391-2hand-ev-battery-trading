import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PostRatingService } from './post-ratings.service';
import { CreatePostRatingDto } from './dto/create-post-rating.dto';
import { PostRatingResponseDto, PostRatingListResponseDto } from './dto/post-rating-response.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import type { ReqUser } from 'src/core/decorators/current-user.decorator';

@ApiTags('Post Ratings')
@Controller('ratings')
export class PostRatingController {
  constructor(private readonly postRatingService: PostRatingService) {}

  @ApiOperation({ summary: 'Create a rating for a post' })
  @ApiParam({ name: 'id', description: 'Post ID', example: '123' })
  @ApiResponse({
    status: 201,
    description: 'Rating created successfully',
    type: PostRatingResponseDto,
  })
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
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort order',
    enum: ['newest', 'rating_desc', 'rating_asc'],
    example: 'newest',
  })
  @ApiResponse({
    status: 200,
    description: 'Ratings retrieved successfully',
    type: PostRatingListResponseDto,
  })
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
  @ApiResponse({
    status: 200,
    description: 'Rating retrieved successfully',
    type: PostRatingResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: ReqUser) {
    const currentUserId = user.sub;
    const review = await this.postRatingService.findOne(id, currentUserId);
    if (!review) throw new NotFoundException('Rating not found');
    return review;
  }

  @ApiOperation({ summary: 'Get seller rating statistics' })
  @ApiParam({ name: 'sellerId', description: 'Seller Account ID', example: '123' })
  @ApiResponse({
    status: 200,
    description: 'Seller rating stats retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        averageRating: { type: 'number', example: 4.4, description: 'Average rating (0-5)' },
        totalReviews: { type: 'number', example: 8, description: 'Total number of reviews' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid seller ID' })
  @Get('seller/:sellerId/stats')
  async getSellerRatingStats(@Param('sellerId') sellerId: string) {
    return this.postRatingService.getSellerRatingStats(Number(sellerId));
  }

  // @UseGuards(JwtAuthGuard)
  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updatePostRatingDto: UpdatePostRatingDto,
  //   @CurrentUser() user: ReqUser) {
  //   return this.postRatingService.update(id, updatePostRatingDto, user.sub);
  // }

  // @ApiOperation({ summary: 'Delete a rating by ID' })
  // @ApiParam({ name: 'id', description: 'Rating ID', example: '123' })
  // @ApiResponse({ status: 200, description: 'Rating deleted successfully' })
  // @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  // @ApiResponse({ status: 403, description: 'Forbidden - Not the owner of this rating' })
  // @ApiResponse({ status: 404, description: 'Rating not found' })
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @Delete(':id')
  // removeById(@Param('id') id: string, @CurrentUser() user: ReqUser) {
  //   return this.postRatingService.removeById(id, user.sub);
  // }

  // @ApiOperation({ summary: "Delete user's rating for a specific post" })
  // @ApiParam({ name: 'id', description: 'Post ID', example: '123' })
  // @ApiResponse({ status: 200, description: 'Rating deleted successfully' })
  // @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  // @ApiResponse({ status: 404, description: 'Rating not found for this post and user' })
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @Delete('/post/:id')
  // removeByPostId(@Param('id') id: string, @CurrentUser() user: ReqUser) {
  //   return this.postRatingService.removeByPostId(id, user.sub);
  // }
}
