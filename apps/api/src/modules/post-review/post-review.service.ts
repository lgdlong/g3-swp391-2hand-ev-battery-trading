import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostReviewLog } from './entities/post-review-log.entity';
import { ReviewActionEnum } from 'src/shared/enums/review.enum';


@Injectable()
export class PostReviewService {
  constructor(
    @InjectRepository(PostReviewLog)
    private readonly postReviewRepo : Repository<PostReviewLog>,
    )
  {}
 
  async create(data: {
    postId: string;
    actorId: number | null;
    oldStatus: string | null;
    newStatus: string | null;
    reason: string | undefined;
     action: ReviewActionEnum;
  }): Promise<PostReviewLog> {
    const reviewLog = this.postReviewRepo.create({
      post: { id: String(data.postId) } as any,   
      actor: data.actorId ? ({ id: data.actorId } as any) : null,
      oldStatus: data.oldStatus as any,
      newStatus: data.newStatus as any,
      reason: data.reason,
      action: data.action,
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
