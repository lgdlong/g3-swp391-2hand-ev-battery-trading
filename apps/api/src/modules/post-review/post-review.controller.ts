import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostReviewService } from './post-review.service';


@Controller('post-review')
export class PostReviewController {
  constructor(private readonly postReviewService: PostReviewService) {}


  @Get()
  findAll() {
    return this.postReviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postReviewService.findOne(id);
  }


}
