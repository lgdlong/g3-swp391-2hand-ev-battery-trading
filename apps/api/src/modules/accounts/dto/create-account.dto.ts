import { IsEmail, IsOptional, IsPhoneNumber, IsNotEmpty, MinLength } from 'class-validator';
import { AtLeastOne } from '../../../core/decorators/at-least-one.decorator';

export class CreateAccountDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @AtLeastOne(['email', 'phone'], {
    message: 'Either email or phone must be provided',
  })
  email?: string;

  @IsOptional()
  @IsPhoneNumber('VN', { message: 'Phone number must be valid' })
  phone?: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsNotEmpty({ message: 'Full name is required' })
  fullName!: string;
}
