import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_SALT_ROUNDS } from '../../shared/constants';
import * as bcrypt from 'bcrypt';
import { normalizeEmailOrPhone } from '../../shared/helpers/account.helper';
import { SummaryAccountDto } from './dto/summary-account.dto';
import { CreateAccountResponseDto } from './dto/create-account-response.dto';
import { SafeAccountDto } from './dto/safe-account.dto';
import { AccountMapper } from './mappers';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly repo: Repository<Account>,
    private readonly configService: ConfigService,
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
    let saltRounds = parseInt(
      this.configService.get('HASH_SALT_ROUNDS', DEFAULT_SALT_ROUNDS.toString()),
      10,
    );
    if (isNaN(saltRounds) || saltRounds < 10) saltRounds = DEFAULT_SALT_ROUNDS;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHashed = await bcrypt.hash(dto.password, salt);

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

  async findAll(limit = 20, offset = 0): Promise<SafeAccountDto[]> {
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

  async findOneByEmailOrPhone(value: string): Promise<Account | null> {
    return this.repo.findOne({ where: normalizeEmailOrPhone(value) });
  }

  async fineMe(userId: number): Promise<SafeAccountDto> {
    const acc = await this.repo.findOne({ where: { id: userId} });
    if(!acc) throw new NotFoundException('Account not account');
    return AccountMapper.toSafeDto(acc);
  }

  async updateMe(userId: number, dto: UpdateAccountDto): Promise<SafeAccountDto>{
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

    const updated = await this.repo.findOne ({ where: { id: userId}});
    if(!updated) throw new NotFoundException('Account not found after update');
    return AccountMapper.toSafeDto(updated);
  }

  findByEmail(email: string) {
    return `This action returns a account with email ${email}`;
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return `This action updates a #${id} account`;
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }
}
