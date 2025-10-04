import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { comparePassword } from '../../shared/helpers/account.helper';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Account } from '../accounts/entities/account.entity';
import { ConfigService } from '@nestjs/config';
import {
  DEFAULT_JWT_EXPIRATION_TIME,
  DEFAULT_JWT_REFRESH_EXPIRATION_TIME,
} from '../../shared/constants';
import { Tokens } from './interfaces/tokens.interface';
import { LoginResponse } from './dto/login-response.dto';
import { SummaryAccountDto } from '../accounts/dto/summary-account.dto';
import { SafeAccountDto } from '../accounts/dto/safe-account.dto';
import { getRandomPassword } from 'src/shared/helpers/account.helper';
import { AccountStatus } from '../../shared/enums/account-status.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  /** seconds */
  // getAccessTokenTtlSeconds(): number {
  //   const s = this.configService.get('JWT_EXPIRATION_TIME') || DEFAULT_JWT_EXPIRATION_TIME; // e.g. "15m" or "900s"
  //   // Nếu bạn đang dùng dạng số giây trong env thì parseInt trả sẵn, nếu dùng "15m" thì nên chuẩn hoá.
  //   // Ở đây giả định bạn dùng số giây:
  //   return Number(s) || 900;
  // }

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

    // 3. Kiểm tra trạng thái tài khoản - từ chối đăng nhập nếu bị banned
    this.validateAccountStatus(account);

    // So sánh mật khẩu đã hash với mật khẩu người dùng nhập vào
    const isMatch = await comparePassword(pass, account.passwordHashed);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    const aEmail = account.email ? account.email : null;
    const aPhone = account.phone ? account.phone : null;

    // 3. Tạo JWT token
    // Tạo payload cho JWT, có thể thêm thông tin khác nếu cần
    const payload: JwtPayload = {
      sub: account.id,
      email: aEmail,
      phone: aPhone,
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
        phone: account.phone,
        fullName: account.fullName,
        role: account.role,
        status: account.status,
        createdAt: account.createdAt.toISOString(),
      } as SummaryAccountDto,
    } as LoginResponse;
  }

  /**
   * Xử lý đăng nhập bằng Google OAuth.
   * - Kiểm tra tính hợp lệ của profile từ Google
   * - Upsert account trong DB (tạo mới nếu chưa có, không ghi đè mật khẩu user cũ)
   * - Patch mềm thông tin còn thiếu (name/avatar)
   * - Ký JWT access/refresh token và trả về LoginResponse
   */
  async handleGoogleLogin(googleProfile: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
    provider: string;
    emailVerified?: boolean;
  }): Promise<LoginResponse> {
    // 1) Validate đầu vào từ Google -------------------------
    if (!googleProfile?.email) {
      // Nếu không có email thì không thể map tới account → từ chối
      throw new UnauthorizedException('Google profile missing email');
    }
    if (googleProfile.emailVerified === false) {
      // Ngăn account takeover: chỉ chấp nhận email đã verify từ Google
      throw new UnauthorizedException('Google email is not verified');
    }

    // 2) Chuẩn hoá email để tránh duplicate (viết hoa/thường, khoảng trắng)
    const normalizedEmail = googleProfile.email.trim().toLowerCase();

    // 3) Upsert account trong DB ----------------------------
    // - Nếu email chưa tồn tại: tạo mới với password random (không dùng tới)
    // - Nếu đã tồn tại: KHÔNG ghi đè password cũ
    // - Không ghi đè name/avatar đã có (sẽ xử lý patch mềm ở bước 4)
    let account = await this.accountsService.upsertByEmail({
      email: normalizedEmail,
      fullName: googleProfile.name,
      avatarUrl: googleProfile.avatar,
      rawPasswordIfNew: getRandomPassword(),
    });

    // 4) Patch mềm các field còn thiếu ----------------------
    // Chỉ cập nhật name/avatar nếu hiện tại chưa có (tránh overwrite data user cũ)
    const patch: Partial<SafeAccountDto> = {};
    if (!account.fullName && googleProfile.name) patch.fullName = googleProfile.name;
    if (!account.avatarUrl && googleProfile.avatar) patch.avatarUrl = googleProfile.avatar;
    if (Object.keys(patch).length) {
      account = await this.accountsService.update(account.id, patch);
    }

    // 5) Kiểm tra trạng thái tài khoản ----------------------
    // Từ chối đăng nhập nếu account bị banned
    this.validateAccountStatus(account);

    // 6) Ký JWT token ---------------------------------------
    // Payload chỉ chứa claims cần thiết (sub, email, phone, role).
    // Không đưa thông tin thừa từ Google vào JWT để tránh rò dữ liệu.
    const payload: JwtPayload = {
      sub: account.id,
      email: account.email,
      phone: account.phone ?? null,
      role: account.role,
    };
    const tokens: Tokens = await this.signTokens(payload);

    // 7) Trả về LoginResponse chuẩn hoá ---------------------
    // FE sẽ nhận được accessToken, refreshToken và thông tin account summary.
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      account: {
        id: account.id,
        email: account.email,
        phone: account.phone ?? null,
        fullName: account.fullName ?? googleProfile.name,
        role: account.role,
        status: account.status,
        createdAt: account.createdAt
          ? new Date(account.createdAt).toISOString()
          : new Date().toISOString(), // fallback nếu DB không có createdAt
      } as SummaryAccountDto,
    };
  }

  private validateAccountStatus(account: Account | SafeAccountDto): void {
    if (account.status === AccountStatus.BANNED) {
      // log in nestjs terminal
      this.logger.warn(`Banned account login attempt: ${account.id}`);
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
