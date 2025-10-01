import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PostBookmarksService } from './post_bookmarks.service';
import { CreatePostBookmarkDto } from './dto/create-post_bookmark.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { SafeAccountDto } from '../accounts/dto/safe-account.dto';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';


@ApiTags('Post Bookmarks')
@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class PostBookmarksController {
  constructor(private readonly postBookmarksService: PostBookmarksService) {}

  
  @Post()
  @ApiCreatedResponse({ type: SafeAccountDto })
  async create(@CurrentUser('id') user: { sub: number }, @Body() createPostBookmarkDto: CreatePostBookmarkDto) {
    return this.postBookmarksService.create(user.sub, createPostBookmarkDto);
  }

  @Get()
  async getAll() {
    return this.postBookmarksService.getAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postBookmarksService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postBookmarksService.remove(+id);
  }
}
