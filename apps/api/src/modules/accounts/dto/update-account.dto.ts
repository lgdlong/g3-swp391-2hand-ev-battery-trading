import { IsOptional, IsString, Length, Matches, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiPropertyOptional({ example: 'Nguyen Van A' })
  @IsOptional()
  @IsString()
  @Length(2, 80)
  fullName?: string;

  @ApiPropertyOptional({ example: '+84 912 345 678' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\- ]{7,20}$/, { message: 'Phone is invalid' })
  phone?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/u/avatar.png',
  })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

}
