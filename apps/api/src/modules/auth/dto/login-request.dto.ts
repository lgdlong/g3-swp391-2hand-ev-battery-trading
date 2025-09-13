import { IsNotEmpty, MinLength } from 'class-validator';

export class LoginRequestDto {
  @IsNotEmpty({ message: 'Email or phone is required' })
  identifier!: string; // người dùng nhập email hoặc số điện thoại

  @IsNotEmpty({ message: 'Password is required!' })
  @MinLength(6, { message: 'Password must be at least 6 characters.' })
  password!: string;
}
