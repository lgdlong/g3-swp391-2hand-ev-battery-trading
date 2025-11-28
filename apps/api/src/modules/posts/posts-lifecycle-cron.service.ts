import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { PostStatus } from '../../shared/enums/post.enum';
import { PostLifecycleService } from '../settings/service/post-lifecycle.service';

/**
 * PostsLifecycleCronService
 * Tự động xử lý vòng đời của post
 * - Auto-archive bài đăng khi hết hạn
 */
@Injectable()
export class PostsLifecycleCronService {
  private readonly logger = new Logger(PostsLifecycleCronService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
    private readonly postLifecycleService: PostLifecycleService,
  ) {}

  /**
   * Cron job chạy mỗi phút để kiểm tra và auto-archive các bài đăng hết hạn
   *
   * Điều kiện tự động archive:
   * - Status = PUBLISHED
   * - reviewedAt + expirationDays <= now
   * - Chưa có refund record (để tránh xung đột với cron refund)
   */
  @Cron(CronExpression.EVERY_5_MINUTES, {
    name: 'auto-archive-expired-posts',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleExpiredPostsAutoArchive(): Promise<void> {
    this.logger.log('[CRON] Starting auto-archive for expired posts...');

    try {
      // Lấy cấu hình thời gian hết hạn
      const postLifecycle = await this.postLifecycleService.findOne(1);
      const expirationDays = postLifecycle?.expirationDays ?? 30;

      // Tính ngày hết hạn
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() - expirationDays);

      this.logger.log(
        `Looking for posts reviewed before ${expirationDate.toISOString()} (expiration: ${expirationDays} days)`,
      );

      // Tìm các bài đăng PUBLISHED hết hạn
      const expiredPosts = await this.postsRepo
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.seller', 'seller')
        .where('post.status = :status', { status: PostStatus.PUBLISHED })
        .andWhere('post.reviewedAt IS NOT NULL')
        .andWhere('post.reviewedAt <= :expirationDate', { expirationDate })
        .getMany();

      this.logger.log(`Found ${expiredPosts.length} expired posts to auto-archive`);

      if (expiredPosts.length === 0) {
        this.logger.log('No expired posts to archive');
        return;
      }

      // Archive từng bài
      let successCount = 0;
      let failCount = 0;

      for (const post of expiredPosts) {
        try {
          post.status = PostStatus.ARCHIVED;
          post.archivedAt = new Date();
          await this.postsRepo.save(post);
          successCount++;
          this.logger.log(
            `✅ Auto-archived post ${post.id} (${post.title}) - expired after ${expirationDays} days`,
          );
        } catch (error) {
          failCount++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`Failed to auto-archive post ${post.id}: ${errorMessage}`);
        }
      }

      this.logger.log(
        `🎯 [CRON] Auto-archive completed: ${successCount} archived, ${failCount} failed`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `💥 [CRON] Critical error in auto-archive job: ${errorMessage}`,
        errorStack,
      );
    }
  }
}
