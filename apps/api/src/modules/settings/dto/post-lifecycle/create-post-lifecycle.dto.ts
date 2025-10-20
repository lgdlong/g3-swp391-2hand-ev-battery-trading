import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class CreatePostLifecycleDto {
  @ApiPropertyOptional({
    description: 'Post expiration days (null for no expiration)',
    minimum: 0,
    example: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  expirationDays?: number | null;

  @ApiPropertyOptional({
    description: 'Auto approve posts',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  autoApprove?: boolean | null;
}
