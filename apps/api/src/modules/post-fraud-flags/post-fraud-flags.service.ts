import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PostFraudFlag, FraudFlagStatus } from './entities/post-fraud-flag.entity';
import { CreateFlagDto } from './dto/create-flag.dto';
import { UpdateFlagStatusDto } from './dto/update-flag-status.dto';

@Injectable()
export class PostFraudFlagsService {
  constructor(
    @InjectRepository(PostFraudFlag)
    private readonly fraudFlagRepo: Repository<PostFraudFlag>,
  ) {}

  /**
   * 1.1. TẠO MỚI CỜ/FLAG POST
   * CHECK: Kiểm tra xem post_id đã có flag với status IN ('SUSPECTED', 'CONFIRMED')
   */
  async createFlag(dto: CreateFlagDto): Promise<PostFraudFlag> {
    // Check if post already has active flag
    const existingFlag = await this.fraudFlagRepo.findOne({
      where: {
        postId: dto.postId,
        status: In([FraudFlagStatus.SUSPECTED, FraudFlagStatus.CONFIRMED]),
      },
    });

    if (existingFlag) {
      throw new BadRequestException(
        `Post ${dto.postId} already has an active fraud flag with status ${existingFlag.status}`,
      );
    }

    // Create new flag
    const newFlag = this.fraudFlagRepo.create({
      postId: dto.postId,
      status: FraudFlagStatus.SUSPECTED,
      flaggedBy: dto.flaggedBy || null,
      reason: dto.reason,
      reviewedBy: null,
      reviewedAt: null,
    });

    return this.fraudFlagRepo.save(newFlag);
  }

  /**
   * 1.2. LẤY CỜ THEO POST ID
   */
  async getFlagByPostId(postId: string): Promise<PostFraudFlag | null> {
    return this.fraudFlagRepo.findOne({
      where: { postId },
      relations: ['post', 'flaggedByAccount', 'reviewedByAccount'],
    });
  }

  /**
   * 1.3. CẬP NHẬT STATUS (XỬ LÝ CỜ)
   */
  async updateFlagStatus(postId: string, dto: UpdateFlagStatusDto): Promise<PostFraudFlag> {
    const flag = await this.fraudFlagRepo.findOne({
      where: { postId },
    });

    if (!flag) {
      throw new NotFoundException(`Fraud flag for post ${postId} not found`);
    }

    if (flag.status === dto.status) {
      throw new BadRequestException(`Flag already has status ${dto.status}`);
    }

    // Update flag
    flag.status = dto.status;
    flag.reviewedBy = dto.reviewedBy;
    flag.reviewedAt = new Date();
    flag.reason = dto.reviewReason; // Ghi đè lý do cuối cùng

    return this.fraudFlagRepo.save(flag);
  }

  /**
   * 1.4. LẤY DANH SÁCH CÁC POST BỊ GẮN CỜ
   */
  async getFlaggedPosts(
    status: 'SUSPECTED' | 'CONFIRMED' | 'ALL',
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: PostFraudFlag[]; total: number }> {
    const queryBuilder = this.fraudFlagRepo
      .createQueryBuilder('pff')
      .leftJoinAndSelect('pff.post', 'p')
      .leftJoinAndSelect('pff.flaggedByAccount', 'flaggedBy')
      .leftJoinAndSelect('pff.reviewedByAccount', 'reviewedBy');

    // Apply filter
    if (status !== 'ALL') {
      queryBuilder.where('pff.status = :status', { status });
    }

    // Paginate
    const [data, total] = await queryBuilder
      .orderBy('pff.flagged_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  /**
   * 2.1. KIỂM TRA TRẠNG THÁI GIAN LẬN (Dùng trong tính Refund)
   * Returns TRUE if post is suspected or confirmed fraud
   */
  async isPostFraudSuspected(postId: string): Promise<boolean> {
    const flag = await this.fraudFlagRepo.findOne({
      where: {
        postId,
        status: In([FraudFlagStatus.SUSPECTED, FraudFlagStatus.CONFIRMED]),
      },
      select: ['id'], // Chỉ lấy id để tối ưu
    });

    return !!flag;
  }

  /**
   * 2.2. TỰ ĐỘNG GẮN CỜ (System Flag)
   * Used by system to automatically flag suspicious posts
   */
  async systemFlagPost(postId: string, reason: string): Promise<PostFraudFlag> {
    return this.createFlag({
      postId,
      reason,
      flaggedBy: null, // System flag
    });
  }
}
