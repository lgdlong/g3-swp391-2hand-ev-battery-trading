import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, Length } from 'class-validator';

export class CreateServiceTypeDto {
  @ApiProperty({ example: 'WALLET_TOPUP', description: 'Unique service type code' })
  @IsString()
  @Length(2, 50)
  code!: string;

  @ApiProperty({ example: 'Nạp tiền vào ví', description: 'Display name for users' })
  @IsString()
  @Length(2, 255)
  name!: string;

  @ApiProperty({
    example: 'Top up wallet balance',
    description: 'Service type description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, description: 'Whether service type is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
