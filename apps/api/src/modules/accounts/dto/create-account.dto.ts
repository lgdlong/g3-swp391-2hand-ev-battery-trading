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
  @IsEmail({}, { message: 'Email phải là một địa chỉ email hợp lệ' })
  @AtLeastOne(['email', 'phone'], {
    message: 'Phải cung cấp email hoặc số điện thoại',
  })
  email?: string;

  @ApiProperty({
    example: '0901234567',
    required: false,
    description: 'Số điện thoại đăng nhập (có thể bỏ trống nếu dùng email)',
    nullable: true,
  })
  @IsOptional()
  @IsPhoneNumber('VN', { message: 'Số điện thoại phải hợp lệ' })
  phone?: string;

  @ApiProperty({
    example: 'P@ssw0rd',
    minLength: 6,
    description: 'Mật khẩu (tối thiểu 6 ký tự)',
  })
  @IsNotEmpty({ message: 'Mật khẩu là bắt buộc' })
  @MinLength(6, { message: 'Mật khẩu phải ít nhất 6 ký tự' })
  password!: string;

  @ApiProperty({
    example: 'Alice Nguyen',
    description: 'Tên đầy đủ của người dùng',
  })
  @IsNotEmpty({ message: 'Tên đầy đủ là bắt buộc' })
  fullName!: string;
}
