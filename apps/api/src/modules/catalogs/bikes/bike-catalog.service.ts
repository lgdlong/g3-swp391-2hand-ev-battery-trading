import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, QueryFailedError, Repository } from 'typeorm';
import { BikeBrand } from './entities/bike-brand.entity';
import { BikeModel } from './entities/bike-model.entity';
import { BikeTrim } from './entities/bike-trim.entity';
import { ListQueryDto } from '../../../shared/dto/list-query.dto';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { LiteItem } from './interfaces/lite-item.interface';
import { CreateBrandDto, CreateModelDto, CreateTrimDto } from './dto/create-bike-catalog.dto';

@Injectable()
export class BikeCatalogService {
  constructor(
    @InjectRepository(BikeBrand) private readonly brandRepo: Repository<BikeBrand>,
    @InjectRepository(BikeModel) private readonly modelRepo: Repository<BikeModel>,
    @InjectRepository(BikeTrim) private readonly trimRepo: Repository<BikeTrim>,
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
    // Đảm bảo brand tồn tại
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

  async getTrimsByModel(modelId: number, query: ListQueryDto): Promise<LiteItem[]> {
    const exists = await this.modelRepo.exists({ where: { id: modelId } });
    if (!exists) throw new NotFoundException(`Model ${modelId} not found`);

    const qb = this.trimRepo
      .createQueryBuilder('t')
      .leftJoin('t.model', 'm')
      .where('m.id = :modelId', { modelId });

    if (query.q) qb.andWhere('t.name ILIKE :q', { q: `%${query.q}%` });

    qb.orderBy('t.name', query.order || 'ASC')
      .offset(query.offset ?? 0)
      .limit(query.limit ?? 50)
      .select(['t.id AS id', 't.name AS name']);

    const rows = await qb.getRawMany<LiteItem>();
    return rows;
  }

  async getModels(query: ListQueryDto & { brandId?: number }): Promise<LiteItem[]> {
    const qb = this.modelRepo.createQueryBuilder('m').leftJoin('m.brand', 'b');

    if (query.brandId) qb.where('b.id = :brandId', { brandId: query.brandId });
    if (query.q) qb.andWhere('m.name ILIKE :q', { q: `%${query.q}%` });

    qb.orderBy('m.name', query.order || 'ASC')
      .offset(query.offset ?? 0)
      .limit(query.limit ?? 50)
      .select(['m.id AS id', 'm.name AS name']);

    return qb.getRawMany<LiteItem>();
  }

  async getTrims(query: ListQueryDto & { modelId?: number }): Promise<LiteItem[]> {
    const qb = this.trimRepo.createQueryBuilder('t').leftJoin('t.model', 'm');

    if (query.modelId) qb.where('m.id = :modelId', { modelId: query.modelId });
    if (query.q) qb.andWhere('t.name ILIKE :q', { q: `%${query.q}%` });

    qb.orderBy('t.name', query.order || 'ASC')
      .offset(query.offset ?? 0)
      .limit(query.limit ?? 50)
      .select(['t.id AS id', 't.name AS name']);

    return qb.getRawMany<LiteItem>();
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

  async createTrim(dto: CreateTrimDto): Promise<LiteItem> {
    const modelId = dto.modelId;
    if (!modelId) throw new BadRequestException('modelId is required');

    const model = await this.modelRepo.findOne({ where: { id: modelId } });
    if (!model) throw new NotFoundException(`Model ${modelId} not found`);

    try {
      const trim = this.trimRepo.create({
        name: dto.name.trim(),
        model,
      });
      const saved = await this.trimRepo.save(trim);
      return { id: saved.id, name: saved.name };
    } catch (err) {
      this.handleUniqueError(err, `Trim '${dto.name}' already exists under model ${modelId}`);
    }
  }

  // -------- helpers --------

  private handleUniqueError(err: unknown, message: string): never {
    if (err instanceof QueryFailedError && err.message.includes('duplicate key')) {
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

  async deleteTrim(trimId: number): Promise<void> {
    const result = await this.trimRepo.delete(trimId);
    if (result.affected === 0) {
      throw new NotFoundException(`Trim ${trimId} not found`);
    }
  }
}
