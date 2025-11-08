import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContractDto {
  @ApiProperty({
    description: 'ID của bài đăng (post)',
  })
  @IsNotEmpty()
  @IsString()
  listingId!: string;
}


