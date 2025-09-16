import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly isDev: boolean;

  constructor(private readonly config: ConfigService) {
    super();
    this.isDev = this.config.get<string>('NODE_ENV') === 'development';
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (this.isDev) {
      // ===== DEVELOPMENT: chi tiết lỗi =====
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('JWT token expired');
      }
      if (info?.message === 'No auth token') {
        throw new UnauthorizedException('JWT access token required');
      }
      if (err || !user) {
        throw new UnauthorizedException('Invalid JWT token');
      }
      return user;
    } else {
      // ===== PRODUCTION: gom message =====
      if (err || !user) {
        throw new UnauthorizedException('JWT access token required');
      }
      return user;
    }
  }
}
