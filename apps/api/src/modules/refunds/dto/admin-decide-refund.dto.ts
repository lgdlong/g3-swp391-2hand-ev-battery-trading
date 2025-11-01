import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for admin to decide on refund request (approve/reject)
 */
export class AdminDecideRefundDto {
  @ApiProperty({
    description: 'Admin decision on refund',
    enum: ['approve', 'reject'],
    example: 'approve',
  })
  @IsEnum(['approve', 'reject'])
  decision!: 'approve' | 'reject';

  @ApiPropertyOptional({
    description: 'Admin notes/reason for the decision',
    example: 'Verified user identity, no fraud detected',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNotes?: string;
}
