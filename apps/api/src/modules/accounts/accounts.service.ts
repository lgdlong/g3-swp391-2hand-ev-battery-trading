import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_SALT_ROUNDS } from '../../shared/constants';
import * as bcrypt from 'bcrypt';
import { normalizeEmailOrPhone } from '../../shared/helpers/account.helper';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly repo: Repository<Account>,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateAccountDto) {
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

    return this.repo.save(account);
  }

  findAll() {
    return `This action returns all accounts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} account`;
  }

  async findOneByEmailOrPhone(value: string): Promise<Account | null> {
    return this.repo.findOne({ where: normalizeEmailOrPhone(value) });
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
