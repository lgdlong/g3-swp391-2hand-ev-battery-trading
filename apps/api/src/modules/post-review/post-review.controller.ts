import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostReviewService } from './post-review.service';
import { CreatePostReviewDto } from './dto/create-post-review.dto';
import { UpdatePostReviewDto } from './dto/update-post-review.dto';

@Controller('post-review')
export class PostReviewController {
  constructor(private readonly postReviewService: PostReviewService) {}

  @Post()
  create(@Body() createPostReviewDto: CreatePostReviewDto) {
    return this.postReviewService.create(createPostReviewDto);
  }

  @Get()
  findAll() {
    return this.postReviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postReviewService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostReviewDto: UpdatePostReviewDto) {
    return this.postReviewService.update(+id, updatePostReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postReviewService.remove(+id);
  }
}
