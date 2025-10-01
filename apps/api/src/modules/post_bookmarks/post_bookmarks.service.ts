import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostBookmark } from './entities/post_bookmark.entity';
import { CreatePostBookmarkDto } from './dto/create-post_bookmark.dto';

@Injectable()
export class PostBookmarksService {
  constructor(
    @InjectRepository(PostBookmark) private readonly BookmarkRepository: Repository<PostBookmark>,
  ) {}

  async create(accountId: number, createPostBookmarkDto: CreatePostBookmarkDto) {
    const create = await this.BookmarkRepository.create({ accountId, ...createPostBookmarkDto });
    return this.BookmarkRepository.save(create);
  }

  async getAll() {
   return await this.BookmarkRepository.find();
  }

  async findOne(id: number) {
    return await this.BookmarkRepository.findOne({ where: { id } });
  }


  async remove(id: number) {
    await this.BookmarkRepository.delete(id);
    return { deleted: true };
  }
}
