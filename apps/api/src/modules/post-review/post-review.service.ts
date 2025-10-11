import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostReviewLog } from './entities/post-review-log.entity';
import { ReviewActionEnum } from 'src/shared/enums/review.enum';
import { CreateReviewLogDto } from './dto/create-review-log.dto';


@Injectable()
export class PostReviewService {
  constructor(
    @InjectRepository(PostReviewLog)
    private readonly postReviewRepo : Repository<PostReviewLog>,
    )
  {}
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
    return this.postReviewRepo.find({
      relations: ['post', 'actor'],
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: string): Promise<PostReviewLog | null> {
    return this.postReviewRepo.findOne({ 
      where: { id },
      relations: ['post', 'actor'],
    });
  }
}
