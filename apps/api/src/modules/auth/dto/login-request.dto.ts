import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({
    example: 'long@gmail.com',
    description: 'Email hoặc số điện thoại dùng để đăng nhập',
  })
  @IsNotEmpty({ message: 'Phải nhập email hoặc số điện thoại' })
  identifier!: string; // người dùng nhập email hoặc số điện thoại

  @ApiProperty({ example: 'Abcd1234@', minLength: 6 })
  @IsNotEmpty({ message: 'Password is required!' })
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  password!: string;
}
