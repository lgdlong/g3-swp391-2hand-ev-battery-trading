import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostMediaService } from './post-media.service';
import { CreatePostMediaDto } from './dto/create-post-media.dto';
import { UpdatePostMediaDto } from './dto/update-post-media.dto';

@Controller('post-media')
export class PostMediaController {
  constructor(private readonly postMediaService: PostMediaService) {}

  @Post()
  create(@Body() createPostMediaDto: CreatePostMediaDto) {
    return this.postMediaService.create(createPostMediaDto);
  }

  @Get()
  findAll() {
    return this.postMediaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postMediaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostMediaDto: UpdatePostMediaDto) {
    return this.postMediaService.update(+id, updatePostMediaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postMediaService.remove(+id);
  }
}
