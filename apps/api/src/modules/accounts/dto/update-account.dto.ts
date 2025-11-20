import { IsOptional, IsString, Length, Matches, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VIETNAMESE_PHONE_REGEX } from 'src/shared/regex';

export class UpdateAccountDto {
  @ApiPropertyOptional({ example: 'Nguyen Van A' })
  @IsOptional()
  @IsString()
  @Length(2, 80)
  fullName?: string;

  @ApiPropertyOptional({ example: '+84 912 345 678' })
  @IsOptional()
  @IsString()
  @Matches(VIETNAMESE_PHONE_REGEX, { message: 'Số điện thoại không phù hợp' })
  phone?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/u/avatar.png',
  })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
