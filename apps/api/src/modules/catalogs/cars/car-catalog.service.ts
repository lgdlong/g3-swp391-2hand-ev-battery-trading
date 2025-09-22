import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, QueryFailedError, Repository } from 'typeorm';
import { CarBrand } from './entities/car-brand.entity';
import { CarModel } from './entities/car-model.entity';
import { ListQueryDto } from '../../../shared/dto/list-query.dto';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { CreateBrandDto, CreateModelDto } from '../shared/dto/create-car-bike-catalog.dto';
import { LiteItem } from '../shared/interfaces/lite-item.interface';

@Injectable()
export class CarCatalogService {
  constructor(
    @InjectRepository(CarBrand) private readonly brandRepo: Repository<CarBrand>,
    @InjectRepository(CarModel) private readonly modelRepo: Repository<CarModel>,
  ) {}

  // ======================================================
  // =============== READ (GET) ENDPOINTS =================
  // ======================================================

  async getBrands(query: ListQueryDto): Promise<LiteItem[]> {
    const where = query.q ? { name: ILike(`%${query.q}%`) } : {};
    const rows = await this.brandRepo.find({
      where,
      order: { name: query.order || 'ASC' },
      take: query.limit,
      skip: query.offset,
      select: { id: true, name: true },
    });
    return rows;
  }

  async getModelsByBrand(brandId: number, query: ListQueryDto): Promise<LiteItem[]> {
    // Đảm bảo brand tồn tại (tuỳ bạn, có thể bỏ check này cho nhanh)
    const exists = await this.brandRepo.exists({ where: { id: brandId } });
    if (!exists) throw new NotFoundException(`Brand ${brandId} not found`);

    const qb = this.modelRepo
      .createQueryBuilder('m')
      .leftJoin('m.brand', 'b')
      .where('b.id = :brandId', { brandId });

    if (query.q) qb.andWhere('m.name ILIKE :q', { q: `%${query.q}%` });

    qb.orderBy('m.name', query.order || 'ASC')
      .offset(query.offset ?? 0)
      .limit(query.limit ?? 50)
      .select(['m.id AS id', 'm.name AS name']);

    const rows = await qb.getRawMany<LiteItem>();
    return rows;
  }

  // ======================================================
  // ============== CREATE (POST) ENDPOINTS ===============
  // ======================================================

  async createBrand(dto: CreateBrandDto): Promise<LiteItem> {
    try {
      const brand = this.brandRepo.create({ name: dto.name.trim() });
      const saved = await this.brandRepo.save(brand);
      return { id: saved.id, name: saved.name };
    } catch (err) {
      this.handleUniqueError(err, `Brand name '${dto.name}' already exists`);
    }
  }

  async createModel(dto: CreateModelDto): Promise<LiteItem> {
    const brandId = dto.brandId;
    if (!brandId) throw new BadRequestException('brandId is required');

    const brand = await this.brandRepo.findOne({ where: { id: brandId } });
    if (!brand) throw new NotFoundException(`Brand ${brandId} not found`);

    try {
      const model = this.modelRepo.create({
        name: dto.name.trim(),
        brand,
      });
      const saved = await this.modelRepo.save(model);
      return { id: saved.id, name: saved.name };
    } catch (err) {
      this.handleUniqueError(err, `Model '${dto.name}' already exists under brand ${brandId}`);
    }
  }

  // -------- helpers --------

  private handleUniqueError(err: unknown, message: string): never {
    // PostgreSQL unique_violation
    if (err instanceof QueryFailedError && (err as any).driverError?.code === '23505') {
      throw new ConflictException(message);
    }
    throw err;
  }

  // ======================================================
  // ============== DELETE (DELETE) ENDPOINTS ===============
  // ======================================================

  async deleteBrand(brandId: number): Promise<void> {
    const result = await this.brandRepo.delete(brandId);
    if (result.affected === 0) {
      throw new NotFoundException(`Brand ${brandId} not found`);
    }
  }

  async deleteModel(modelId: number): Promise<void> {
    const result = await this.modelRepo.delete(modelId);
    if (result.affected === 0) {
      throw new NotFoundException(`Model ${modelId} not found`);
    }
  }
}
