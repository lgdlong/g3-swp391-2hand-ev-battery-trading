import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AccountsService } from '../accounts/accounts.service';
import { SafeAccountDto } from '../accounts/dto/safe-account.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly accountsService: AccountsService,
  ) {
    // @ts-ignore
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
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

    // For regular users, fetch from database
    const userId: number = payload.sub;

    if (isNaN(userId) || userId <= 0) {
      throw new Error('Invalid user ID');
    }

    const user: SafeAccountDto = await this.accountsService.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Return the full Account entity which will be available as request.user
    return user;
  }
}
