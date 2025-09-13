import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Account } from '../accounts/entities/account.entity';
import { ConfigService } from '@nestjs/config';
import {
  DEFAULT_JWT_EXPIRATION_TIME,
  DEFAULT_JWT_REFRESH_EXPIRATION_TIME,
} from '../../shared/constants';
import { Tokens } from './interfaces/tokens.interface';
import { LoginResponse } from './interfaces/login-response.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async signTokens(payload: JwtPayload) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION_TIME') || DEFAULT_JWT_EXPIRATION_TIME,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn:
          this.configService.get('JWT_REFRESH_EXPIRATION_TIME') ||
          DEFAULT_JWT_REFRESH_EXPIRATION_TIME,
      }),
    ]);
    return { accessToken: at, refreshToken: rt } as Tokens;
  }

  async validateUser(emailOrPhone: string, pass: string): Promise<LoginResponse> {
    // 1. Tìm tài khoản theo email hoặc số điện thoại
    const account: Account | null = await this.accountsService.findOneByEmailOrPhone(emailOrPhone);

    // 2. Kiểm tra tài khoản có tồn tại không và mật khẩu có khớp không
    if (!account) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    // So sánh mật khẩu đã hash bằng bcrypt với mật khẩu người dùng nhập vào
    const isMatch = await bcrypt.compare(pass, account.passwordHashed);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    // 3. Tạo JWT token
    // Tạo payload cho JWT, có thể thêm thông tin khác nếu cần
    const payload: JwtPayload = {
      sub: account.id,
      role: account.role,
    };

    const tokens: Tokens = await this.signTokens(payload);

    // TODO: lưu refreshToken đã hash vào DB
    // const hashedRefreshToken = tokens.refresh_token;

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      account: {
        id: account.id,
        email: account.email,
        role: account.role,
        fullName: account.fullName,
        phone: account.phone,
        avatarUrl: account.avatarUrl,
      },
    } as LoginResponse;
  }
}
