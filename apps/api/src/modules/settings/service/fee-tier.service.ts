import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeeTier } from '../entities/fee-tier.entity';
import { CreateFeeTierDto } from '../dto/fee-tier/create-fee-tier.dto';
import { UpdateFeeTierDto } from '../dto/fee-tier/update-fee-tier.dto';
import { FeeTierMapper } from '../mappers/fee-tier.mapper';

@Injectable()
export class FeeTierService {
  constructor(
    @InjectRepository(FeeTier)
    private readonly feeTierRepository: Repository<FeeTier>,
  ) {}

  async create(createFeeTierDto: CreateFeeTierDto) {
    // Check for overlapping tiers
    await this.validateTierRange(createFeeTierDto.minPrice, createFeeTierDto.maxPrice ?? null);

    const feeTier = this.feeTierRepository.create({
      ...createFeeTierDto,
      active: createFeeTierDto.active ?? true,
    });

    const saved = await this.feeTierRepository.save(feeTier);
    return FeeTierMapper.toResponseDto(saved);
  }

  async findAll() {
    const feeTiers = await this.feeTierRepository.find({
      order: { updatedAt: 'DESC' },
    });
    return FeeTierMapper.toResponseDtoArray(feeTiers);
  }

  async findOne(id: number) {
    const feeTier = await this.feeTierRepository.findOne({ where: { id } });
    if (!feeTier) {
      throw new NotFoundException(`Fee tier with ID ${id} not found`);
    }
    return FeeTierMapper.toResponseDto(feeTier);
  }

  async update(id: number, updateFeeTierDto: UpdateFeeTierDto) {
    const feeTier = await this.feeTierRepository.findOne({ where: { id } });
    if (!feeTier) {
      throw new NotFoundException(`Fee tier with ID ${id} not found`);
    }

    // Check for overlapping tiers if range is being updated
    if (updateFeeTierDto.minPrice !== undefined || updateFeeTierDto.maxPrice !== undefined) {
      const minPrice = updateFeeTierDto.minPrice ?? feeTier.minPrice;
      const maxPrice = updateFeeTierDto.maxPrice ?? feeTier.maxPrice;
      await this.validateTierRange(minPrice, maxPrice, id);
    }

    Object.assign(feeTier, updateFeeTierDto);
    const saved = await this.feeTierRepository.save(feeTier);
    return FeeTierMapper.toResponseDto(saved);
  }

  async remove(id: number) {
    const feeTier = await this.feeTierRepository.findOne({ where: { id } });
    if (!feeTier) {
      throw new NotFoundException(`Fee tier with ID ${id} not found`);
    }

    await this.feeTierRepository.remove(feeTier);
    return { message: 'Fee tier deleted successfully' };
  }

  private async validateTierRange(minPrice: number, maxPrice: number | null, excludeId?: number) {
    const query = this.feeTierRepository.createQueryBuilder('tier');

    if (excludeId) {
      query.andWhere('tier.id != :excludeId', { excludeId });
    }

    // Check for overlapping ranges
    if (maxPrice !== null) {
      query.andWhere(
        '(tier.min_price <= :maxPrice AND (tier.max_price >= :minPrice OR tier.max_price IS NULL))',
        { minPrice, maxPrice },
      );
    } else {
      query.andWhere('tier.max_price IS NULL OR tier.max_price >= :minPrice', { minPrice });
    }

    const overlapping = await query.getOne();
    if (overlapping) {
      throw new BadRequestException('Fee tier price range overlaps with existing tier');
    }
  }
}
