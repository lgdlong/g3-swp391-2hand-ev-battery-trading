import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmContractDto {
  @ApiPropertyOptional({
    description: 'Ghi chú khi xác nhận (tùy chọn)',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  note?: string;
}


