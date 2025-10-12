import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { ConfigService } from '@nestjs/config';
import {
  normalizeEmailOrPhone,
  hashPasswordWithConfig,
  getRandomPassword,
} from '../../shared/helpers/account.helper';
import { SummaryAccountDto } from './dto/summary-account.dto';
import { CreateAccountResponseDto } from './dto/create-account-response.dto';
import { SafeAccountDto } from './dto/safe-account.dto';
import { AccountMapper } from './mappers';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { AccountStatus } from 'src/shared/enums/account-status.enum';
import { AccountRole } from 'src/shared/enums/account-role.enum';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly repo: Repository<Account>,
    private readonly configService: ConfigService,
    private readonly uploadService: UploadService,
  ) {}

  async create(dto: CreateAccountDto): Promise<CreateAccountResponseDto> {
    // 0) Yêu cầu ít nhất 1 trong 2
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email or phone is required!');
    }

    // 1) Chuẩn hoá + check trùng
    const normalizedEmail = dto.email ? dto.email.toLowerCase().trim() : undefined;
    const normalizedPhone = dto.phone ? dto.phone.replace(/\D/g, '') : undefined;

    if (normalizedEmail) {
      const exists = await this.repo.findOne({ where: { email: normalizedEmail } });
      if (exists) throw new ConflictException('Email already registered!');
    }
    if (normalizedPhone) {
      const pExists = await this.repo.findOne({ where: { phone: normalizedPhone } });
      if (pExists) throw new ConflictException('Phone number already registered!');
    }

    // 2) Hash password
    const passwordHashed = await hashPasswordWithConfig(
      dto.password,
      this.configService.get('HASH_SALT_ROUNDS'),
    );

    // 3) Tạo & lưu
    const account = this.repo.create({
      fullName: dto.fullName,
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHashed,
      // role/status... nếu cần default ở entity
    });

    // 4) Save vào db và trả về account đã save
    const accountAfterSave: Account = await this.repo.save(account);

    // 5) Tạo một đối tượng summary chỉ show dữ liệu cần thiết
    // Chú ý: không trả về passwordHashed
    const summaryAccount: SummaryAccountDto = {
      id: accountAfterSave.id,
      email: accountAfterSave.email,
      phone: accountAfterSave.phone,
      fullName: accountAfterSave.fullName,
      avatarUrl: accountAfterSave.avatarUrl,
      role: accountAfterSave.role,
      status: accountAfterSave.status,
      createdAt: accountAfterSave.createdAt.toISOString(),
    } as SummaryAccountDto;

    // 6) Trả về thông báo thành công và account summary
    return {
      account: summaryAccount,
      message: 'Account created successfully!',
    } as CreateAccountResponseDto;
  }

  async findAll(limit?: number, offset?: number): Promise<SafeAccountDto[]> {
    const accounts: Account[] = await this.repo.find({
      take: limit, // giới hạn số lượng record
      skip: offset, // số lượng bỏ qua record tính từ đầu (phục vụ pagination)
    });
    return AccountMapper.toSafeDtoArray(accounts);
  }

  async findOne(id: number): Promise<SafeAccountDto> {
    if (!id || id <= 0) {
      throw new NotFoundException(`Invalid account id: ${id}`);
    }

    const account: Account | null = await this.repo.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Account with id ${id} not found`);
    }

    return AccountMapper.toSafeDto(account);
  }

  async countAccounts(status?: string): Promise<{ count: number; status?: string }> {
    const queryBuilder = this.repo.createQueryBuilder('account');

    if (status) {
      // Case-insensitive comparison using UPPER for compatibility across databases
      queryBuilder.where('UPPER(account.status) = UPPER(:status)', { status });
    }

    const count = await queryBuilder.getCount();
    return { count, status };
  }

  async findOneByEmailOrPhone(value: string): Promise<Account | null> {
    return this.repo.findOne({ where: normalizeEmailOrPhone(value) });
  }

  async findMe(userId: number): Promise<SafeAccountDto> {
    if (!userId || userId <= 0) throw new NotFoundException(`Invalid account id: ${userId}`);
    const acc = await this.repo.findOne({ where: { id: userId } });
    if (!acc) throw new NotFoundException('Account not found');
    return AccountMapper.toSafeDto(acc);
  }

  async updateMe(userId: number, dto: UpdateAccountDto): Promise<SafeAccountDto> {
    if (dto.phone) {
      const existingAccount = await this.repo.findOne({
        where: { phone: dto.phone, id: Not(userId) },
      });
      if (existingAccount) {
        throw new ConflictException('Phone number already in use.');
      }
    }

    const result = await this.repo.update({ id: userId }, dto);
    if (result.affected === 0) {
      throw new NotFoundException(`Account with id ${userId} not found`);
    }

    const updated = await this.repo.findOne({ where: { id: userId } });
    if (!updated) throw new NotFoundException('Account not found after update');
    return AccountMapper.toSafeDto(updated);
  }

  async updateStatus(id: number, status: AccountStatus): Promise<SafeAccountDto> {
    const account = await this.repo.findOneByOrFail({ id });
    account.status = status;
    await this.repo.save(account);
    return AccountMapper.toSafeDto(account);
  }

  async findByEmail(email: string): Promise<SafeAccountDto> {
    if (!email) {
      throw new NotFoundException(`Invalid account id: ${email}`);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const account: Account | null = await this.repo.findOne({ where: { email: normalizedEmail } });
    if (!account) {
      throw new NotFoundException(`Account with email ${email} not found`);
    }
    return AccountMapper.toSafeDto(account);
  }

  async update(accountId: number, updateAccountDto: UpdateAccountDto): Promise<SafeAccountDto> {
    if (!accountId || accountId <= 0) {
      throw new NotFoundException(`Invalid account id: ${accountId}`);
    }

    // Check if phone is being updated and ensure it's not already taken by another user
    const updateAccountPhone = updateAccountDto.phone;
    if (updateAccountPhone) {
      const existingAccount = await this.repo.findOne({
        where: { phone: updateAccountPhone, id: Not(accountId) },
      });
      if (existingAccount) {
        throw new ConflictException('Phone number already in use.');
      }
    }

    const result = await this.repo.update({ id: accountId }, updateAccountDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Account with id ${accountId} not found`);
    }

    const updated = await this.repo.findOne({ where: { id: accountId } });
    if (!updated) {
      throw new NotFoundException('Account not found after update');
    }

    return AccountMapper.toSafeDto(updated);
  }

  async upsertByEmail(input: {
    email: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    rawPasswordIfNew?: string;
  }): Promise<SafeAccountDto> {
    // 1) INSERT ... ON CONFLICT/ DUPLICATE KEY DO NOTHING
    await this.repo
      .createQueryBuilder()
      .insert()
      .into(Account)
      .values({
        email: input.email,
        fullName: input.fullName ?? '',
        avatarUrl: input.avatarUrl ?? null,
        passwordHashed: await hashPasswordWithConfig(
          input.rawPasswordIfNew ?? getRandomPassword(),
          this.configService.get('HASH_SALT_ROUNDS'),
        ),
        // googleId, provider, emailVerified... nếu có cột
      })
      .orIgnore() // PG: DO NOTHING, MySQL: ON DUPLICATE KEY UPDATE IGNORE
      .execute();

    // 2) Load lại
    let acc = await this.repo.findOne({ where: { email: input.email } });
    if (!acc) throw new Error('Upsert failed: account not found');

    // 3) Patch mềm: chỉ cập nhật khi đang trống
    const patch: Partial<Account> = {};
    if (!acc.fullName && input.fullName) patch.fullName = input.fullName;
    if (!acc.avatarUrl && input.avatarUrl) patch.avatarUrl = input.avatarUrl;

    if (Object.keys(patch).length) {
      await this.repo.update(acc.id, patch);
      acc = await this.repo.findOneOrFail({ where: { email: input.email } });
    }

    return AccountMapper.toSafeDto(acc);
  }

  async updateRole(id: number, roleUpdate: AccountRole): Promise<SafeAccountDto> {
    const account = await this.repo.findOneByOrFail({ id });

    // Chống không cho hạ cấp admin cuối cùng (cần tối thiểu 1 admin trong db)
    if (account.role === AccountRole.ADMIN && roleUpdate === AccountRole.USER) {
      const adminCount = await this.repo.count({ where: { role: AccountRole.ADMIN } });
      if (adminCount <= 1) {
        throw new ForbiddenException('Cannot demote the last admin.');
      }
    }

    account.role = roleUpdate;
    await this.repo.save(account);
    return AccountMapper.toSafeDto(account);
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }

  async updateAvatar(accountId: number, file: Express.Multer.File): Promise<SafeAccountDto> {
    const account = await this.repo.findOne({ where: { id: accountId } });
    if (!account) throw new NotFoundException('Account not found');

    const oldPublicId = account.avatarPublicId;

    const res = await this.uploadService.uploadImage(file, { folder: `avatars/${accountId}` });

    account.avatarUrl = res.secure_url;
    account.avatarPublicId = res.public_id;
    const updatedAccount = await this.repo.save(account);

    // Nếu có avatar cũ thì xoá sau khi đã cập nhật thành công
    if (oldPublicId) {
      await this.uploadService.deleteImage(oldPublicId).catch(() => null);
    }

    return AccountMapper.toSafeDto(updatedAccount);
  }
}
