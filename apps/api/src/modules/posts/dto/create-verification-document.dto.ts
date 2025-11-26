import { IsString, IsNotEmpty, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PostVerificationDocumentType } from '../../../shared/enums/post-verification-document-type.enum';

export class CreateVerificationDocumentDto {
  @ApiProperty({
    enum: PostVerificationDocumentType,
    description: 'Loại giấy tờ xe',
    example: PostVerificationDocumentType.REGISTRATION_CERTIFICATE,
  })
  @IsEnum(PostVerificationDocumentType)
  @IsNotEmpty()
  type!: PostVerificationDocumentType;

  @ApiProperty({
    description: 'URL của giấy tờ đã upload',
    example: 'https://res.cloudinary.com/.../verification/cavet.jpg',
  })
  @IsUrl()
  @IsNotEmpty()
  url!: string;
}

