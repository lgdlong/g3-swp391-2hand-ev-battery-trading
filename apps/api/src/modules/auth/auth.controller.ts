import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginResponse } from './interfaces/login-response.interface';
import { LoginRequestDto } from './dto/login-request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const loginRes: LoginResponse = await this.authService.validateUser(
      dto.identifier,
      dto.password,
    );

    // Set refresh token vào cookie httpOnly
    res.cookie('refresh_token', loginRes.refreshToken, {
      httpOnly: true,
      secure: true, // true nếu HTTPS
      sameSite: 'lax', // cân nhắc 'strict' hoặc CSRF token
      path: '/auth/refresh', // chỉ gửi kèm khi gọi /auth/refresh
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30d
    });

    return { accessToken: loginRes.accessToken, account: loginRes.account };
  }
}
