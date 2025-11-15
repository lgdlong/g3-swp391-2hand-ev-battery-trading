import { IsNotEmpty, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContractBySellerDto {
  @ApiProperty({
    description: 'ID của bài đăng (post)',
  })
  @IsNotEmpty()
  @IsString()
  listingId!: string;

  @ApiProperty({
    description: 'ID của buyer',
  })
  @IsNotEmpty()
  @IsInt()
  buyerId!: number;
}

