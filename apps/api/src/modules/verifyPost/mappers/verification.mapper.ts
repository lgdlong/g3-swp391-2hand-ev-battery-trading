import { PostVerificationRequest } from '../entities/post-verification-request.entity';
import { VerificationRequestResponseDto, PostWithVerificationDto } from '../dto/verification.dto';
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
   * This method handles the final verification status (isVerified, verifiedAt, verifiedBy)
   */
  static mapVerificationStatusToDto(post: Post, dto: BasePostResponseDto): void {
    dto.isVerified = post.isVerified;
    dto.verifiedAt = post.verifiedAt;
    dto.verifiedBy = post.verifiedBy ? AccountMapper.toSafeDto(post.verifiedBy) : null;
  }
}
