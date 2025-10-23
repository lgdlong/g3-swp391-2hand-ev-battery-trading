import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateServiceTypeDto } from './create-service-type.dto';
import { IsOptional, IsString, IsBoolean, Length } from 'class-validator';

export class UpdateServiceTypeDto extends PartialType(CreateServiceTypeDto) {
  @ApiPropertyOptional({ example: 'Updated Service Name' })
  @IsOptional()
  @IsString()
  @Length(2, 255)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
