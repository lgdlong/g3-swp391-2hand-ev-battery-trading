import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({
    example: 'aaa@gmail.com',
    description: 'Email hoặc số điện thoại dùng để đăng nhập',
  })
  @IsNotEmpty({ message: 'Email or phone is required' })
  identifier!: string; // người dùng nhập email hoặc số điện thoại

  @ApiProperty({ example: '123456', minLength: 6 })
  @IsNotEmpty({ message: 'Password is required!' })
  @MinLength(6, { message: 'Password must be at least 6 characters.' })
  password!: string;
}
