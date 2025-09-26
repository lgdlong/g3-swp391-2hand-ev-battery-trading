import { Controller, Post, Get, Body, Res, HttpCode, Req, UseGuards } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginResponse } from './dto/login-response.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GoogleOAuthGuard } from 'src/core/guards/google-oauth.guard';
import { DEFAULT_FRONTEND_URL } from 'src/shared/constants';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Đăng nhập (email/phone + password)',
    description:
      'Trả về access token (Bearer) và set refresh token vào cookie httpOnly (đường dẫn /auth/refresh).',
  })
  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({
    description: 'Đăng nhập thành công. Refresh token nằm trong cookie (httpOnly).',
    type: LoginResponse,
  })
  @ApiUnauthorizedResponse({ description: 'Sai thông tin đăng nhập.' })
  @ApiBadRequestResponse({ description: 'Thiếu hoặc không hợp lệ tham số.' })
  @ApiResponse({
    status: 200,
    description: 'Header phản hồi có Set-Cookie chứa refresh_token.',
    headers: {
      'Set-Cookie': {
        description:
          'refresh_token=<JWT>; HttpOnly; SameSite=Lax; Path=/auth/refresh; Max-Age=2592000; Secure(ở prod)',
        schema: { type: 'string' },
      },
    },
  })
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

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Bắt đầu Google OAuth' })
  async googleAuth() {
    // Passport sẽ redirect sang Google, không cần xử lý gì ở đây
  }

  @Get('google-redirect')
  @UseGuards(GoogleOAuthGuard)
  @HttpCode(302)
  @ApiOperation({ summary: 'Google OAuth callback (không cookie, redirect kèm token)' })
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const googleProfile = req.user as {
        googleId: string;
        email: string;
        name: string;
        avatar?: string;
        provider: string;
        emailVerified?: boolean;
      };

      const login: LoginResponse = await this.authService.handleGoogleLogin(googleProfile);
      const frontendUrl = this.config.get<string>('FRONTEND_URL') || DEFAULT_FRONTEND_URL;

      const url = new URL(frontendUrl.replace(/\/$/, '') + '/oauth/google');
      // Chỉ kèm access_token
      url.hash = new URLSearchParams({
        access_token: login.accessToken,
      }).toString();

      return res.redirect(url.toString());
    } catch (error) {
      console.error('Google OAuth error:', error);
      const frontendUrl = this.config.get<string>('FRONTEND_URL') || DEFAULT_FRONTEND_URL;
      const errorUrl = new URL(frontendUrl);
      errorUrl.searchParams.set('error', 'google_auth_failed');
      return res.redirect(errorUrl.toString());
    }
  }
}
