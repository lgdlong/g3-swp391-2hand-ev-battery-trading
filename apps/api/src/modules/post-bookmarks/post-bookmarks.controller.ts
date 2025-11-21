import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PostBookmarksService } from './post-bookmarks.service';
import { CreatePostBookmarkDto } from './dto/create-post-bookmark.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { PostBookmarkDto } from './dto/post-bookmark.dto';
import type { ReqUser } from 'src/core/decorators/current-user.decorator';

@ApiTags('Post Bookmarks')
@ApiBearerAuth()
@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class PostBookmarksController {
  constructor(private readonly postBookmarksService: PostBookmarksService) {}

  // Create a bookmark
  @Post()
  @ApiOperation({
    summary: 'Create a new bookmark',
    description: "Add a post to user's bookmarks. User must be authenticated.",
  })
  @ApiCreatedResponse({
    type: PostBookmarkDto,
    description: 'Bookmark created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid post ID or missing required fields',
  })
  @ApiConflictResponse({
    description: 'Post is already bookmarked by this user',
  })
  async create(@CurrentUser() user: ReqUser, @Body() createPostBookmarkDto: CreatePostBookmarkDto) {
    if (!user || !user.sub) {
      throw new UnauthorizedException('Xác thực người dùng thất bại');
    }
    return this.postBookmarksService.create(user.sub, createPostBookmarkDto);
  }

  // Get all bookmarks for the authenticated user
  @Get()
  @ApiOperation({
    summary: 'Get all bookmarks',
    description: 'Retrieve all bookmarks for the current authenticated user',
  })
  @ApiOkResponse({
    type: [PostBookmarkDto],
    description: 'List of user bookmarks retrieved successfully',
  })
  async getAll(@CurrentUser() user: ReqUser) {
    if (!user || !user.sub) {
      throw new UnauthorizedException('Xác thực người dùng thất bại');
    }
    return this.postBookmarksService.getAll(user.sub);
  }

  // Get a specific bookmark by ID (only if user owns it)
  @Get(':id')
  @ApiOperation({
    summary: 'Get bookmark by ID',
    description: 'Retrieve a specific bookmark by its ID (only your own bookmarks)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the bookmark to retrieve',
    example: 1,
  })
  @ApiOkResponse({
    type: PostBookmarkDto,
    description: 'Bookmark retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Bookmark not found or access denied',
  })
  @ApiBadRequestResponse({
    description: 'Invalid bookmark ID format',
  })
  @ApiForbiddenResponse({
    description: "Cannot access other users' bookmarks",
  })
  async findOne(@CurrentUser() user: ReqUser, @Param('id', ParseIntPipe) id: number) {
    if (!user || !user.sub) {
      throw new UnauthorizedException('Xác thực người dùng thất bại');
    }

    // First get the bookmark to check ownership
    const bookmark = await this.postBookmarksService.findOne(id, user.sub);

    // Check if the bookmark belongs to the current user
    if (bookmark.accountId !== user.sub) {
      throw new ForbiddenException('Không thể truy cập bài đăng đã lưu của người dùng khác');
    }

    return bookmark;
  }

  // Delete a bookmark by ID (only if user owns it)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete bookmark',
    description: "Remove a bookmark from user's bookmarks by ID (only your own bookmarks)",
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the bookmark to delete',
    example: 1,
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        deleted: {
          type: 'boolean',
          example: true,
          description: 'Indicates if the bookmark was successfully deleted',
        },
      },
    },
    description: 'Bookmark deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Bookmark not found or access denied',
  })
  @ApiBadRequestResponse({
    description: 'Invalid bookmark ID format',
  })
  @ApiForbiddenResponse({
    description: "Cannot delete other users' bookmarks",
  })
  async remove(@CurrentUser() user: ReqUser, @Param('id', ParseIntPipe) id: number) {
    if (!user || !user.sub) {
      throw new UnauthorizedException('Xác thực người dùng thất bại');
    }

    // Lấy bookmark để verify ownership
    const bookmark = await this.postBookmarksService.findOne(id, user.sub);

    // Double-check ownership (defense in depth)
    if (bookmark.accountId !== user.sub) {
      throw new ForbiddenException('Không thể xóa bài đăng đã lưu của người dùng khác');
    }

    // Chỉ xóa khi đã confirm ownership
    return this.postBookmarksService.remove(id, user.sub);
  }
}
