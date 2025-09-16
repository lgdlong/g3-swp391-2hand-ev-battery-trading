import { IsEmail, IsOptional, IsPhoneNumber, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AtLeastOne } from '../../../core/decorators/at-least-one.decorator';

export class CreateAccountDto {
  @ApiProperty({
    example: 'alice@example.com',
    required: false,
    description: 'Email đăng nhập (có thể bỏ trống nếu dùng phone)',
    nullable: true,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @AtLeastOne(['email', 'phone'], {
    message: 'Either email or phone must be provided',
  })
  email?: string;

  @ApiProperty({
    example: '0901234567',
    required: false,
    description: 'Số điện thoại đăng nhập (có thể bỏ trống nếu dùng email)',
    nullable: true,
  })
  @IsOptional()
  @IsPhoneNumber('VN', { message: 'Phone number must be valid' })
  phone?: string;

  @ApiProperty({
    example: 'P@ssw0rd',
    minLength: 6,
    description: 'Mật khẩu (tối thiểu 6 ký tự)',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @ApiProperty({
    example: 'Alice Nguyen',
    description: 'Tên đầy đủ của người dùng',
  })
  @IsNotEmpty({ message: 'Full name is required' })
  fullName!: string;
}
