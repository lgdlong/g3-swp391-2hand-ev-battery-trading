import { ApiProperty } from '@nestjs/swagger';
import { PostVerificationDocumentType } from '../../../shared/enums/post-verification-document-type.enum';

export class VerificationDocumentResponseDto {
  @ApiProperty({ description: 'ID của verification document' })
  id!: string;

  @ApiProperty({ description: 'Post ID' })
  postId!: string;

  @ApiProperty({
    enum: PostVerificationDocumentType,
    description: 'Loại giấy tờ',
  })
  type!: PostVerificationDocumentType;

  @ApiProperty({ description: 'URL của giấy tờ' })
  url!: string;

  @ApiProperty({ description: 'Thời gian upload' })
  uploadedAt!: Date;

  @ApiProperty({ description: 'ID người upload' })
  uploadedBy!: number;

  @ApiProperty({ description: 'Thời gian tạo' })
  createdAt!: Date;
}

