import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefundPolicy } from '../entities/refund-policy.entity';
import { CreateRefundPolicyDto } from '../dto/refund-policy/create-refund-policy.dto';
import { UpdateRefundPolicyDto } from '../dto/refund-policy/update-refund-policy.dto';
import { RefundPolicyMapper } from '../mappers/refund-policy.mapper';

@Injectable()
export class RefundPolicyService {
  constructor(
    @InjectRepository(RefundPolicy)
    private readonly refundPolicyRepository: Repository<RefundPolicy>,
  ) {}

  async create(createRefundPolicyDto: CreateRefundPolicyDto) {
    const refundPolicy = this.refundPolicyRepository.create(createRefundPolicyDto);
    const saved = await this.refundPolicyRepository.save(refundPolicy);
    return RefundPolicyMapper.toResponseDto(saved);
  }

  async findAll() {
    const policies = await this.refundPolicyRepository.find({
      order: { updatedAt: 'DESC' },
    });
    return RefundPolicyMapper.toResponseDtoArray(policies);
  }

  async findOne(id: number) {
    const policy = await this.refundPolicyRepository.findOne({ where: { id } });
    if (!policy) {
      throw new NotFoundException(`Refund policy with ID ${id} not found`);
    }
    return RefundPolicyMapper.toResponseDto(policy);
  }

  async update(id: number, updateRefundPolicyDto: UpdateRefundPolicyDto) {
    const policy = await this.refundPolicyRepository.findOne({ where: { id } });
    if (!policy) {
      throw new NotFoundException(`Refund policy with ID ${id} not found`);
    }

    Object.assign(policy, updateRefundPolicyDto);
    const saved = await this.refundPolicyRepository.save(policy);
    return RefundPolicyMapper.toResponseDto(saved);
  }

  async remove(id: number) {
    const policy = await this.refundPolicyRepository.findOne({ where: { id } });
    if (!policy) {
      throw new NotFoundException(`Refund policy with ID ${id} not found`);
    }

    await this.refundPolicyRepository.remove(policy);
    return { message: 'Refund policy deleted successfully' };
  }
}
