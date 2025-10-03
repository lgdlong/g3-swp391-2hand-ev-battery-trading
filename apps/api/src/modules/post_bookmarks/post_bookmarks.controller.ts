import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PostBookmarksService } from './post_bookmarks.service';
import { CreatePostBookmarkDto } from './dto/create-post_bookmark.dto';
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
  ApiConflictResponse
} from '@nestjs/swagger';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { PostBookmarkDto } from './dto/post_bookmark_dto';
import type { ReqUser } from 'src/core/decorators/current-user.decorator';


@ApiTags('Post Bookmarks')
@ApiBearerAuth()
@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class PostBookmarksController {
  constructor(private readonly postBookmarksService: PostBookmarksService) { }

  // Create a bookmark
  @Post()
  @ApiOperation({ 
    summary: 'Create a new bookmark',
    description: 'Add a post to user\'s bookmarks. User must be authenticated.'
  })
  @ApiCreatedResponse({ 
    type: PostBookmarkDto,
    description: 'Bookmark created successfully'
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid post ID or missing required fields'
  })
  @ApiConflictResponse({ 
    description: 'Post is already bookmarked by this user'
  })
  async create(@CurrentUser() user: ReqUser, @Body() createPostBookmarkDto: CreatePostBookmarkDto) {
    if (!user || !user.sub) {
      throw new UnauthorizedException('User authentication failed');
    }
    return this.postBookmarksService.create(user.sub, createPostBookmarkDto);
  }

  // Get all bookmarks for the authenticated user
  @Get()
  @ApiOperation({ 
    summary: 'Get all bookmarks',
    description: 'Retrieve all bookmarks for the current authenticated user'
  })
  @ApiOkResponse({ 
    type: [PostBookmarkDto],
    description: 'List of user bookmarks retrieved successfully'
  })
  async getAll(@CurrentUser() user: ReqUser) {
    if (!user || !user.sub) {
      throw new UnauthorizedException('User authentication failed');
    }
    return this.postBookmarksService.getAll(user.sub);
  }

  // Get all bookmarks for a specific user by user ID
  @Get('user/:userId')
  @ApiOperation({ 
    summary: 'Get bookmarks by user ID',
    description: 'Retrieve all bookmarks for a specific user by their user ID'
  })
  @ApiParam({
    name: 'userId',
    type: Number,
    description: 'The ID of the user whose bookmarks to retrieve',
    example: 1
  })
  @ApiOkResponse({
    type: [PostBookmarkDto],
    description: 'List of user bookmarks retrieved successfully'
  })
  async getByUserId(@Param('userId', ParseIntPipe) userId: number, @CurrentUser() user: ReqUser) {
    if (userId !== user.sub) {
       throw new ForbiddenException('Cannot access other users\' bookmarks');
     }
    return this.postBookmarksService.getByUserId(userId);
  }

  // Get a specific bookmark by ID
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get bookmark by ID',
    description: 'Retrieve a specific bookmark by its ID'
  })
  @ApiParam({ 
    name: 'id', 
    type: Number,
    description: 'The ID of the bookmark to retrieve',
    example: 1
  })
  @ApiOkResponse({ 
    type: PostBookmarkDto,
    description: 'Bookmark retrieved successfully'
  })
  @ApiNotFoundResponse({ 
    description: 'Bookmark not found'
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid bookmark ID format'
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postBookmarksService.findOne(id);
  }

  // Delete a bookmark by ID
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete bookmark',
    description: 'Remove a bookmark from user\'s bookmarks by ID'
  })
  @ApiParam({ 
    name: 'id', 
    type: Number,
    description: 'The ID of the bookmark to delete',
    example: 1
  })
  @ApiOkResponse({ 
    schema: { 
      type: 'object',
      properties: {
        deleted: {
          type: 'boolean',
          example: true,
          description: 'Indicates if the bookmark was successfully deleted'
        }
      }
    },
    description: 'Bookmark deleted successfully'
  })
  @ApiNotFoundResponse({ 
    description: 'Bookmark not found'
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid bookmark ID format'
  })
  async remove(@CurrentUser() user: ReqUser, @Param('id', ParseIntPipe) id: number) {
    if (!user || !user.sub) {
      throw new UnauthorizedException('User authentication failed');
    }
    return this.postBookmarksService.remove(id);
  }
}
