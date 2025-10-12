import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PostReviewService } from './post-review.service';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiOkResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { PostReviewLogDto } from './dto/post-review-logs.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Post Review Logs')
@Controller('post-review')
export class PostReviewController {
  constructor(private readonly postReviewService: PostReviewService) {}

  @Get()
  @ApiOperation({ summary: 'Get all post review logs' })
  @ApiOkResponse({
    description: 'List of post review logs',
    type: [PostReviewLogDto],
  })
  async findAll() {
    return this.postReviewService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post review log by ID' })
  @ApiOkResponse({
    description: 'Post review log details',
    type: PostReviewLogDto,
  })
  async findOne(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 }))
    id: string,
  ) {
    return this.postReviewService.findOne(id);
  }
}
