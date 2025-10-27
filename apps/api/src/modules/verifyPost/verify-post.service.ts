import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PostVerificationRequest,
  VerificationStatus,
} from './entities/post-verification-request.entity';
import { Post } from '../posts/entities/post.entity';
import { Account } from '../accounts/entities/account.entity';
import {
  RequestVerificationDto,
  ApproveVerificationDto,
  RejectVerificationDto,
} from './dto/verification.dto';
import { VerificationRequestResponseDto } from './dto/verification-request-response.dto';
import { VerificationMapper } from './mappers/verification.mapper';
import { PostStatus } from '../../shared/enums/post.enum';
import { AccountRole } from '../../shared/enums/account-role.enum';
import { WalletsService } from '../wallets/wallets.service';
import { PostLifecycleService } from '../settings/service/post-lifecycle.service';

// Fixed verification fee (in VND)
const VERIFICATION_FEE = 50000; // 50,000 VND

@Injectable()
export class VerifyPostService {
  constructor(
    @InjectRepository(PostVerificationRequest)
    private verificationRepo: Repository<PostVerificationRequest>,
    @InjectRepository(Post)
    private postsRepo: Repository<Post>,
    @InjectRepository(Account)
    private accountsRepo: Repository<Account>,
    @Inject(forwardRef(() => WalletsService))
    private readonly walletsService: WalletsService,
    private readonly postLifecycleService: PostLifecycleService,
  ) {}

  /**
   * Get verification fee
   * @returns Verification fee in VND
   */
  getVerificationFee(): number {
    return VERIFICATION_FEE;
  }

  /**
   * Request verification for a post (User/Seller only)
   * Only published posts can request verification
   * Requires payment from user's wallet
   */
  async requestVerification(
    postId: string,
    userId: number,
    dto: RequestVerificationDto,
  ): Promise<VerificationRequestResponseDto> {
    const post = await this.postsRepo.findOne({
      where: { id: postId },
      relations: ['seller'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Check if user is the owner of the post
    if (post.seller.id !== userId) {
      throw new BadRequestException('You can only request verification for your own posts');
    }

    // Check if post is published
    if (post.status !== PostStatus.PUBLISHED) {
      throw new BadRequestException('Only published posts can request verification');
    }

    // Check if verification request already exists
    const existingRequest = await this.verificationRepo.findOne({
      where: { postId },
    });

    if (existingRequest) {
      // Allow new request only if previous request was rejected
      if (existingRequest.status === VerificationStatus.REJECTED) {
        // Deduct verification fee from wallet
        try {
          await this.walletsService.deduct(
            userId,
            VERIFICATION_FEE.toString(),
            'POST_VERIFICATION',
            `Phí kiểm định bài đăng #${postId}`,
            'post_verification_requests',
            postId,
          );
        } catch (error) {
          if (error instanceof Error && error.message.includes('Insufficient balance')) {
            throw new BadRequestException(
              `Số dư không đủ. Cần ${VERIFICATION_FEE.toLocaleString('vi-VN')} ₫ để yêu cầu kiểm định.`,
            );
          }
          throw error;
        }

        // Update existing rejected request to pending
        existingRequest.status = VerificationStatus.PENDING;
        existingRequest.requestedAt = new Date();
        existingRequest.reviewedAt = null;
        existingRequest.rejectReason = null;

        const updatedRequest = await this.verificationRepo.save(existingRequest);

        return VerificationMapper.toResponseDto(updatedRequest);
      } else if (existingRequest.status === VerificationStatus.APPROVED) {
        throw new BadRequestException('This post is already verified');
      } else {
        throw new BadRequestException('Đã gửi yêu cầu kiểm định cho bài đăng này');
      }
    }

    // Deduct verification fee from wallet BEFORE creating request
    try {
      await this.walletsService.deduct(
        userId,
        VERIFICATION_FEE.toString(),
        'POST_VERIFICATION',
        `Phí kiểm định bài đăng #${postId}`,
        'post_verification_requests',
        postId,
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('Insufficient balance')) {
        throw new BadRequestException(
          `Số dư không đủ. Cần ${VERIFICATION_FEE.toLocaleString('vi-VN')} ₫ để yêu cầu kiểm định.`,
        );
      }
      throw error;
    }

    // Create verification request
    const verificationRequest = this.verificationRepo.create({
      postId,
      requestedBy: userId,
      status: VerificationStatus.PENDING,
    });

    const savedRequest = await this.verificationRepo.save(verificationRequest);

    return VerificationMapper.toResponseDto(savedRequest);
  }

  /**
   * Approve verification request (Admin only)
   */
  async approveVerification(
    postId: string,
    adminId: number,
    dto: ApproveVerificationDto,
  ): Promise<VerificationRequestResponseDto> {
    const verificationRequest = await this.verificationRepo.findOne({
      where: { postId },
      relations: ['post'],
    });

    if (!verificationRequest) {
      throw new NotFoundException('Verification request not found');
    }

    if (verificationRequest.status !== VerificationStatus.PENDING) {
      throw new BadRequestException('Verification request is not pending');
    }

    // Update verification request
    verificationRequest.status = VerificationStatus.APPROVED;
    verificationRequest.reviewedAt = new Date();
    await this.verificationRepo.save(verificationRequest);

    return VerificationMapper.toResponseDto(verificationRequest);
  }

  /**
   * Reject verification request (Admin only)
   */
  async rejectVerification(
    postId: string,
    adminId: number,
    dto: RejectVerificationDto,
  ): Promise<VerificationRequestResponseDto> {
    const verificationRequest = await this.verificationRepo.findOne({
      where: { postId },
    });

    if (!verificationRequest) {
      throw new NotFoundException('Verification request not found');
    }

    if (verificationRequest.status !== VerificationStatus.PENDING) {
      throw new BadRequestException('Verification request is not pending');
    }

    // Update verification request
    verificationRequest.status = VerificationStatus.REJECTED;
    verificationRequest.reviewedAt = new Date();
    verificationRequest.rejectReason = dto.rejectReason;
    await this.verificationRepo.save(verificationRequest);

    return VerificationMapper.toResponseDto(verificationRequest);
  }

  /**
   * Get verification request by post ID
   * Authorization: Only post owner or admin can view the verification request
   */
  async getVerificationRequest(
    postId: string,
    userId: number,
    userRole: AccountRole,
  ): Promise<VerificationRequestResponseDto | null> {
    const verificationRequest = await this.verificationRepo.findOne({
      where: { postId },
      relations: ['post', 'post.seller'],
    });

    if (!verificationRequest) {
      return null;
    }

    // Check authorization: user must be post owner or admin
    const isAdmin = userRole === AccountRole.ADMIN;
    const isPostOwner = verificationRequest.post.seller.id === userId;

    if (!isAdmin && !isPostOwner) {
      throw new ForbiddenException('You do not have permission to view this verification request');
    }

    return VerificationMapper.toResponseDto(verificationRequest);
  }

  /**
   * Get all pending verification requests (Admin only)
   */
  async getPendingVerificationRequests(): Promise<VerificationRequestResponseDto[]> {
    const verificationRequests = await this.verificationRepo.find({
      where: { status: VerificationStatus.PENDING },
      relations: ['post', 'requester'],
      order: { requestedAt: 'ASC' },
    });

    return VerificationMapper.toResponseDtoList(verificationRequests);
  }

  /**
   * Get all rejected verification requests (Admin only)
   */
  async getRejectedVerificationRequests(): Promise<VerificationRequestResponseDto[]> {
    const verificationRequests = await this.verificationRepo.find({
      where: { status: VerificationStatus.REJECTED },
      relations: ['post', 'requester'],
      order: { reviewedAt: 'DESC' },
    });

    return VerificationMapper.toResponseDtoList(verificationRequests);
  }

  /**
   * Get verification requests by user ID
   */
  async getVerificationRequestsByUser(userId: number): Promise<VerificationRequestResponseDto[]> {
    const verificationRequests = await this.verificationRepo.find({
      where: { requestedBy: userId },
      relations: ['post'],
      order: { requestedAt: 'DESC' },
    });

    return VerificationMapper.toResponseDtoList(verificationRequests);
  }
}
