import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostReviewLog } from './entities/post-review-log.entity';
import { CreateReviewLogDto } from './dto/create-review-log.dto';

@Injectable()
export class PostReviewService {
  constructor(
    @InjectRepository(PostReviewLog)
    private readonly postReviewRepo: Repository<PostReviewLog>,
  ) {}
  // xài dto
  async create(dto: CreateReviewLogDto): Promise<PostReviewLog> {
    const reviewLog = this.postReviewRepo.create({
      post: { id: dto.postId },
      actor: dto.actorId ? { id: Number(dto.actorId) } : null,
      oldStatus: dto.oldStatus || null,
      newStatus: dto.newStatus || null,
      reason: dto.reason || null,
      action: dto.action,
    });

    return this.postReviewRepo.save(reviewLog);
  }

  findAll(): Promise<PostReviewLog[]> {
    // ❌ Old approach (N+1 queries): For 100 logs → 1 + 100 + 100 = 201 queries
    // return this.postReviewRepo.find({
    //   relations: ['post', 'actor'],
    //   order: { createdAt: 'DESC' },
    // });

    // ✅ New approach (Single JOIN query): All data in 1 query
    return this.postReviewRepo
      .createQueryBuilder('reviewLog')
      .leftJoinAndSelect('reviewLog.post', 'post')
      .leftJoinAndSelect('reviewLog.actor', 'actor')
      .orderBy('reviewLog.createdAt', 'DESC')
      .getMany();
  }

  findOne(id: string): Promise<PostReviewLog | null> {
    // ❌ Old approach (Potential N+1 queries)
    // return this.postReviewRepo.findOne({
    //   where: { id },
    //   relations: ['post', 'actor'],
    // });

    // ✅ New approach (Single JOIN query)
    return this.postReviewRepo
      .createQueryBuilder('reviewLog')
      .leftJoinAndSelect('reviewLog.post', 'post')
      .leftJoinAndSelect('reviewLog.actor', 'actor')
      .where('reviewLog.id = :id', { id })
      .getOne();
  }

  findByPostId(postId: string): Promise<PostReviewLog[]> {
    // Retrieve review logs for a specific post using repository.find with relations
    return this.postReviewRepo.find({
      where: { post: { id: postId } },
      relations: ['post', 'actor'],
      order: { createdAt: 'DESC' },
    });
  }

  findOneByMyPostId(userId: string, postId: string): Promise<PostReviewLog[]> {
    // Retrieve all review logs for a specific post of the user using QueryBuilder
    return this.postReviewRepo
      .createQueryBuilder('reviewLog')
      .leftJoinAndSelect('reviewLog.post', 'post')
      .leftJoinAndSelect('reviewLog.actor', 'actor')
      .where('post.id = :postId', { postId })
      .andWhere('post.seller_id = :userId', { userId })
      .orderBy('reviewLog.createdAt', 'DESC')
      .getMany();
  }
}
