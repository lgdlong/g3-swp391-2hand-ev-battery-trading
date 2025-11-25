import { ApiProperty } from '@nestjs/swagger';
import { PostDocumentType } from '../../../shared/enums/post-document-type.enum';

export class PostDocumentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: PostDocumentType })
  documentType!: PostDocumentType;

  @ApiProperty()
  url!: string;

  @ApiProperty()
  publicId!: string;

  @ApiProperty()
  width!: number;

  @ApiProperty()
  height!: number;

  @ApiProperty()
  uploadedAt!: Date;
}

