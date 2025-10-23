import { PostVerificationRequest } from '../entities/post-verification-request.entity';
import { VerificationRequestResponseDto } from '../dto/verification-request-response.dto';
import { PostWithVerificationDto } from '../dto/verification.dto';
import { Post } from '../../posts/entities/post.entity';
import { PostMapper } from '../../posts/mappers/post.mapper';
import { BasePostResponseDto } from '../../posts/dto/base-post-response.dto';
import { AccountMapper } from '../../accounts/mappers';

export class VerificationMapper {
  static toResponseDto(verificationRequest: PostVerificationRequest): VerificationRequestResponseDto {
    return {
      postId: verificationRequest.postId,
      requestedBy: verificationRequest.requestedBy,
      requestedAt: verificationRequest.requestedAt,
      status: verificationRequest.status,
      reviewedAt: verificationRequest.reviewedAt || undefined,
      rejectReason: verificationRequest.rejectReason || undefined,
      createdAt: verificationRequest.createdAt,
      updatedAt: verificationRequest.updatedAt,
    };
  }

  static toResponseDtoList(verificationRequests: PostVerificationRequest[]): VerificationRequestResponseDto[] {
    return verificationRequests.map(this.toResponseDto);
  }

  static toPostWithVerificationDto(post: Post, verificationRequest?: PostVerificationRequest): PostWithVerificationDto {
    const basePostDto = PostMapper.toBasePostResponseDto(post);

    const postWithVerification = new PostWithVerificationDto();
    Object.assign(postWithVerification, basePostDto);

    if (verificationRequest) {
      postWithVerification.verificationRequest = this.toResponseDto(verificationRequest);
    }

    return postWithVerification;
  }

  /**
   * Map verification status fields from Post entity to BasePostResponseDto
   * This method handles the final verification status via verificationRequest relation
   * Note: Verification data is now handled through the verificationRequest relation
   */
  static mapVerificationStatusToDto(post: Post, dto: BasePostResponseDto): void {
    // Verification data is now in dto.verificationRequest
    // No need to map old fields (isVerified, verifiedAt, etc.) as they've been removed
    if (post.verificationRequest) {
      dto.verificationRequest = this.toResponseDto(post.verificationRequest);
    }
  }
}
