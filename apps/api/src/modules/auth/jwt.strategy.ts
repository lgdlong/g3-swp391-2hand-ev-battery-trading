import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) throw new Error('JWT_SECRET is not configured');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: JwtPayload) {
    // Handle Google OAuth users differently from regular users
    // if (payload.provider === 'google') {
    //   // For Google users, return a user-like object based on JWT payload
    //   // since they might not be stored in our database yet
    //   return {
    //     id: payload.sub, // googleId as string
    //     email: payload.email,
    //     name: payload.name,
    //     role: payload.role,
    //     avatar_url: payload.avatar,
    //     provider: 'google',
    //     // Add other required Account properties with defaults
    //     password: '', // Not used for Google users
    //     status: AccountStatus.ACTIVE, // Default status
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //   };
    // }

    const userId: number = payload.sub;

    if (isNaN(userId) || userId <= 0) {
      throw new Error('Invalid user ID');
    }

    // Return the JWT payload directly - it contains all we need for role checking
    return {
      sub: userId,
      email: payload.email, // optional - nếu user đăng nhập bằng email
      phone: payload.phone, // optional - nếu user đăng nhập bằng số điện thoại
      role: payload.role,
      provider: payload.provider,
    } as JwtPayload;
  }
}
