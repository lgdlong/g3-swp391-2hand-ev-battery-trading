import { Controller, Post, Get, Body, Res, HttpCode, Request, UseGuards } from '@nestjs/common';
import { Response } from 'express';
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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Get()
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Request() req) {}

  // @Get('google-redirect')
  // @UseGuards(GoogleOAuthGuard)
  // googleAuthRedirect(@Request() req) {
  //   return this.authService.googleLogin(req);
  // }
}
