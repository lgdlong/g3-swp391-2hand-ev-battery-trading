import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostBookmark } from './entities/post_bookmark.entity';
import { UpdatePostBookmarkDto } from './dto/update-post_bookmark.dto';
import { CreatePostBookmarkDto } from './dto/create-post_bookmark.dto';

@Injectable()
export class PostBookmarksService {
  constructor(
    @InjectRepository(PostBookmark) private readonly BookmarkRepository: Repository<PostBookmark>,
  ) {}

  create(accountId: number, createPostBookmarkDto: CreatePostBookmarkDto) {
    const create = this.BookmarkRepository.create({ accountId, ...createPostBookmarkDto });
    return this.BookmarkRepository.save(create);
  }

  findAll() {
    return `This action returns all postBookmarks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postBookmark`;
  }

  update(id: number, updatePostBookmarkDto: UpdatePostBookmarkDto) {
    return `This action updates a #${id} postBookmark`;
  }

  remove(id: number) {
    return `This action removes a #${id} postBookmark`;
  }
}
