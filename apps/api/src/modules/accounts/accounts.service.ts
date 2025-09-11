import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_SALT_ROUNDS } from '../../shared/constants';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly repo: Repository<Account>,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateAccountDto) {
    // if no email and no phone -> throw error
    if (!dto.email && !dto.phone) {
      throw new ConflictException('Email or phone is required!');
    }

    let normalizedEmail: string = '';
    if (dto.email) {
      // 1. Check email đã tồn tại
      normalizedEmail = dto.email.toLowerCase();
      const exists = await this.repo.findOne({ where: { email: normalizedEmail } });
      if (exists) {
        throw new ConflictException('Email already registered!');
      }
    }

    let normalizedPhone: string = '';
    if (dto.phone) {
      // 2. Check phone đã tồn tại
      normalizedPhone = dto.phone.replace(/\D/g, ''); // remove all non-digit characters
      const phoneExists = await this.repo.findOne({ where: { phone: normalizedPhone } });
      if (phoneExists) {
        throw new ConflictException('Phone number already registered!');
      }
    }

    // 2. Hash password
    let saltRounds = parseInt(
      this.configService.get('HASH_SALT_ROUNDS', DEFAULT_SALT_ROUNDS.toString()),
      10,
    );
    if (isNaN(saltRounds) || saltRounds < 4) {
      saltRounds = DEFAULT_SALT_ROUNDS;
    }
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // 3. Tạo user mới (gán thêm role, email đã chuẩn hóa, và password đã hash)
    const account: Account = this.repo.create({
      ...dto,
      email: normalizedEmail || undefined,
      phone: normalizedPhone || undefined,
      passwordHashed: hashedPassword,
    });

    return this.repo.save(account);
  }

  findAll() {
    return `This action returns all accounts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} account`;
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
