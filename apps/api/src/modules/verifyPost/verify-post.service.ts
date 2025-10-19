import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostVerificationRequest, VerificationStatus } from './entities/post-verification-request.entity';
import { Post } from '../posts/entities/post.entity';
import { Account } from '../accounts/entities/account.entity';
import {
  RequestVerificationDto,
  ApproveVerificationDto,
  RejectVerificationDto,
  VerificationRequestResponseDto
} from './dto/verification.dto';
import { VerificationMapper } from './mappers/verification.mapper';
import { PostStatus } from '../../shared/enums/post.enum';

@Injectable()
export class VerifyPostService {
  constructor(
    @InjectRepository(PostVerificationRequest)
    private verificationRepo: Repository<PostVerificationRequest>,
    @InjectRepository(Post)
    private postsRepo: Repository<Post>,
    @InjectRepository(Account)
    private accountsRepo: Repository<Account>,
  ) {}

  /**
   * Request verification for a post (User/Seller only)
   * Only published posts can request verification
   */
  async requestVerification(
    postId: string,
    userId: number,
    dto: RequestVerificationDto
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

    // Check if already verified
    if (post.isVerified) {
      throw new BadRequestException('This post is already verified');
    }

    // Check if verification request already exists
    const existingRequest = await this.verificationRepo.findOne({
      where: { postId },
    });

    if (existingRequest) {
      // Allow new request only if previous request was rejected
      if (existingRequest.status === VerificationStatus.REJECTED) {
        // Update existing rejected request to pending
        existingRequest.status = VerificationStatus.PENDING;
        existingRequest.requestedAt = new Date();
        existingRequest.reviewedAt = null;
        existingRequest.rejectReason = null;


        const updatedRequest = await this.verificationRepo.save(existingRequest);

        // Update post verificationRequestedAt field
        post.verificationRequestedAt = new Date();
        post.verificationRejectedAt = null;
        await this.postsRepo.save(post);

        return VerificationMapper.toResponseDto(updatedRequest);
      } else {
        throw new BadRequestException('Verification request already exists for this post');
      }
    }

    // Create verification request
    const verificationRequest = this.verificationRepo.create({
      postId,
      requestedBy: userId,
      status: VerificationStatus.PENDING,
    });

    const savedRequest = await this.verificationRepo.save(verificationRequest);

    // Update post verificationRequestedAt field
    post.verificationRequestedAt = new Date();
    await this.postsRepo.save(post);

    return VerificationMapper.toResponseDto(savedRequest);
  }

  /**
   * Approve verification request (Admin only)
   */
  async approveVerification(
    postId: string,
    adminId: number,
    dto: ApproveVerificationDto
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

    // Update post verification status
    const post = verificationRequest.post;
    post.isVerified = true;
    post.verificationRequestedAt = null;
    post.verifiedAt = new Date();
    post.verifiedBy = { id: adminId } as Account;
    await this.postsRepo.save(post);

    return VerificationMapper.toResponseDto(verificationRequest);
  }

  /**
   * Reject verification request (Admin only)
   */
  async rejectVerification(
    postId: string,
    adminId: number,
    dto: RejectVerificationDto
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

    // Update post verification status
    const post = await this.postsRepo.findOne({
      where: { id: postId },
    });
    if (post) {
      post.verificationRequestedAt = null;
      post.verificationRejectedAt = new Date();
      await this.postsRepo.save(post);
    }

    return VerificationMapper.toResponseDto(verificationRequest);
  }

  /**
   * Get verification request by post ID
   */
  async getVerificationRequest(postId: string): Promise<VerificationRequestResponseDto | null> {
    const verificationRequest = await this.verificationRepo.findOne({
      where: { postId },
    });

    if (!verificationRequest) {
      return null;
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
