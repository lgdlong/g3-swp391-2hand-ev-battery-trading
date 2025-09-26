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
import { LoginResponse } from './dto/login-response.dto';
import { SummaryAccountDto } from '../accounts/dto/summary-account.dto';
import { SafeAccountDto } from '../accounts/dto/safe-account.dto';
import { getRandomPassword } from 'src/shared/helpers/account.helper';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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

    // So sánh mật khẩu đã hash bằng bcrypt với mật khẩu người dùng nhập vào
    const isMatch = await bcrypt.compare(pass, account.passwordHashed);
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

  async handleGoogleLogin(googleProfile: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
    provider: string;
    emailVerified?: boolean;
  }): Promise<LoginResponse> {
    // 1) Validate tối thiểu
    // - Bảo vệ chống account takeover: yêu cầu email từ Google phải được verify
    if (!googleProfile?.email) {
      throw new UnauthorizedException('Google profile missing email');
    }
    if (googleProfile.emailVerified === false) {
      // tuỳ policy: có thể gửi 403/401 kèm hướng dẫn
      throw new UnauthorizedException('Google email is not verified');
    }

    // 2) Chuẩn hoá email để tránh duplicate do khác hoa/thường hoặc khoảng trắng
    const normalizedEmail = googleProfile.email.trim().toLowerCase();

    // 3) Tìm theo email
    let account: SafeAccountDto | null = await this.accountsService.findByEmail(normalizedEmail);

    // 4) Nếu chưa có acc trong db thì tạo mới
    if (!account) {
      // Sinh mật khẩu ngẫu nhiên (user Google sẽ không dùng)
      const randomPassword = getRandomPassword();

      // Lưu ý: ở tầng repository nên có unique constraint cho email
      // Nếu có race condition, create có thể ném unique violation; khi đó có thể retry findByEmail.
      await this.accountsService.create({
        email: normalizedEmail,
        password: randomPassword,
        fullName: googleProfile.name,
        // TODO: nếu hệ thống có cột `googleId`, `provider`:
        // googleId: googleProfile.googleId,
        // provider: googleProfile.provider,
        // emailVerified: true, // nếu bạn có cột này trong schema
      });

      // Lấy lại tài khoản an toàn để trả về
      const createdAccount = await this.accountsService.findByEmail(normalizedEmail);
      if (!createdAccount) {
        // Trường hợp cực hiếm khi create thành công nhưng find lại thất bại
        throw new UnauthorizedException('Could not create Google user');
      }
      account = createdAccount;

      // 5) Cập nhật avatar nếu có
      if (googleProfile.avatar) {
        // `update` trả về SafeAccountDto (như bạn đã dùng ở AccountsService)
        account = await this.accountsService.update(account.id, {
          avatarUrl: googleProfile.avatar,
        });
      }
    } else {
      // (Tuỳ chọn) Nếu đã có account mà chưa có avatar, có thể cập nhật mềm ở đây
      // if (!account.avatarUrl && googleProfile.avatar) {
      //   account = await this.accountsService.update(account.id, { avatarUrl: googleProfile.avatar });
      // }
      // (Tuỳ chọn) Nếu bạn lưu `googleId`/`provider`, có thể sync khi thiếu
      // if (!account.googleId) { ... }
    }

    // 6) Ký JWT
    // Payload chỉ chứa claims cần thiết. Nếu không cần `provider`, có thể bỏ.
    const payload: JwtPayload = {
      sub: account.id,
      email: account.email, // giữ cho resource server dễ authorize theo email nếu cần
      phone: account.phone ?? null, // có thể bỏ nếu không cần cho FE/BE
      role: account.role,
      provider: googleProfile.provider, // tuỳ nhu cầu
    };

    const tokens: Tokens = await this.signTokens(payload);

    // (Khuyến nghị) Hash & lưu refresh token vào DB để có thể revoke/rotate sau này
    // await this.accountsService.setHashedRefreshToken(account.id, hash(tokens.refreshToken));

    // 7) Chuẩn hoá dữ liệu trả về (nhất quán DTO)
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      account: {
        id: account.id,
        email: account.email,
        phone: account.phone ?? null, // nếu SummaryAccountDto có field này
        fullName: account.fullName ?? googleProfile.name,
        role: account.role,
        status: account.status, // giả định có
        createdAt: account.createdAt
          ? new Date(account.createdAt).toISOString()
          : new Date().toISOString(),
      } as SummaryAccountDto,
    };
  }
}
