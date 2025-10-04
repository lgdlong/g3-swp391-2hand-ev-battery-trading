import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostBookmark } from './entities/post_bookmark.entity';
import { CreatePostBookmarkDto } from './dto/create-post_bookmark.dto';

@Injectable()
export class PostBookmarksService {
  constructor(
    @InjectRepository(PostBookmark) private readonly bookmarkRepository: Repository<PostBookmark>,
  ) {}

  async create(accountId: number, createPostBookmarkDto: CreatePostBookmarkDto) {
    try {
      // Check for duplicate bookmark
      const existing = await this.bookmarkRepository.findOne({ 
        where: { accountId, postId: createPostBookmarkDto.postId } 
      });
      
      if (existing) {
        throw new ConflictException('Post is already bookmarked by this user');
      }

      const bookmark = this.bookmarkRepository.create({ 
        accountId, 
        ...createPostBookmarkDto 
      });
      
      return await this.bookmarkRepository.save(bookmark);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create bookmark: ${errorMessage}`);
    }
  }

  async getAll(accountId: number) {
    return this.bookmarkRepository.find({ where: { accountId } });
  }


  // Method to find bookmark with strict ownership check
  async findOne(id: number, accountId: number) {
    const bookmark = await this.bookmarkRepository.findOne({ 
      where: { id, accountId } 
    });
    
    if (!bookmark) {
      throw new NotFoundException(`Bookmark with ID ${id} not found or access denied`);
    }
    
    return bookmark;
  }


  async remove(id: number, accountId?: number) {
    // Use findOneByOwner for strict ownership check
    if (accountId !== undefined) {
      await this.findOne(id, accountId);
    } else {
      const bookmark = await this.bookmarkRepository.findOne({ where: { id } });
      if (!bookmark) {
        throw new NotFoundException(`Bookmark with ID ${id} not found`);
      }
    }
    
    await this.bookmarkRepository.delete(id);
    return { deleted: true };
  }
}
