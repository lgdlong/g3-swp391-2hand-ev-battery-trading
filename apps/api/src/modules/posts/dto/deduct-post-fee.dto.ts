import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class DeductPostFeeDto {
  @ApiProperty({
    description: 'Giá bài đăng (VND)',
    example: 50000000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Giá bài đăng phải lớn hơn hoặc bằng 0' })
  priceVnd!: number;

  @ApiProperty({
    description: 'ID bài đăng (required để ghi chép wallet transaction)',
    example: '123',
  })
  @IsString()
  postId!: string;
}
