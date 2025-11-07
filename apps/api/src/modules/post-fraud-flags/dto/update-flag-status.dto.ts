import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { FraudFlagStatus } from '../entities/post-fraud-flag.entity';

export class UpdateFlagStatusDto {
  @ApiProperty({
    example: 'CONFIRMED',
    enum: ['CONFIRMED', 'CLEARED'],
    description: 'Trạng thái mới của cờ',
  })
  @IsEnum([FraudFlagStatus.CONFIRMED, FraudFlagStatus.CLEARED])
  @IsNotEmpty()
  status: FraudFlagStatus.CONFIRMED | FraudFlagStatus.CLEARED;

  @ApiProperty({
    example: 'Đã xác nhận là gian lận, giá không hợp lý',
    description: 'Lý do xử lý/kết quả điều tra',
  })
  @IsString()
  @IsNotEmpty()
  reviewReason: string;

  @ApiProperty({
    example: '1',
    description: 'ID của admin xử lý',
  })
  @IsString()
  @IsNotEmpty()
  reviewedBy: string;
}
