import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostBookmark } from './entities/post-bookmark.entity';
import { CreatePostBookmarkDto } from './dto/create-post-bookmark.dto';

@Injectable()
export class PostBookmarksService {
  constructor(
    @InjectRepository(PostBookmark) private readonly bookmarkRepository: Repository<PostBookmark>,
  ) {}

  async create(accountId: number, createPostBookmarkDto: CreatePostBookmarkDto) {
    try {
      // Ensure proper number types for comparison
      const normalizedAccountId = Number(accountId);
      const normalizedPostId = Number(createPostBookmarkDto.postId);

      // Check for duplicate bookmark with explicit type conversion
      const existing = await this.bookmarkRepository.findOne({
        where: {
          accountId: normalizedAccountId,
          postId: normalizedPostId,
        },
      });

      if (existing) {
        throw new ConflictException('Post is already bookmarked by this user');
      }

      const bookmark = this.bookmarkRepository.create({
        accountId,
        ...createPostBookmarkDto,
      });

      return await this.bookmarkRepository.save(bookmark);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      // Handle database constraint errors
      if (error && typeof error === 'object' && 'code' in error) {
        const dbError = error as any;
        if (dbError.code === '23505') {
          // Unique constraint violation
          throw new ConflictException('Post is already bookmarked by this user');
        }
        if (dbError.code === '23503') {
          // Foreign key constraint
          throw new BadRequestException('Invalid post ID or account ID');
        }
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
      where: { id, accountId },
    });

    if (!bookmark) {
      throw new NotFoundException(`Bookmark with ID ${id} not found or access denied`);
    }

    return bookmark;
  }

  async remove(id: number, accountId: number) {
    //BẮT BUỘC phải có accountId để kiểm tra ownership
    if (!accountId) {
      throw new BadRequestException('User authentication required');
    }

    //Kiểm tra bookmark có thuộc về user này không
    const bookmark = await this.findOne(id, accountId);

    // Xóa bookmark đã được verify ownership
    await this.bookmarkRepository.remove(bookmark);
    return { deleted: true };
  }
}
