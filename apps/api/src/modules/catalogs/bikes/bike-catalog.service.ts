import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, QueryFailedError, Repository } from 'typeorm';
import { BikeBrand } from './entities/bike-brand.entity';
import { BikeModel } from './entities/bike-model.entity';
import { ListQueryDto } from '../../../shared/dto/list-query.dto';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { LiteItem } from '../shared/interfaces/lite-item.interface';
import { CreateBrandDto, CreateModelDto } from '../shared/dto/create-car-bike-catalog.dto';

@Injectable()
export class BikeCatalogService {
  constructor(
    @InjectRepository(BikeBrand) private readonly brandRepo: Repository<BikeBrand>,
    @InjectRepository(BikeModel) private readonly modelRepo: Repository<BikeModel>,
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
    if (!exists) throw new NotFoundException(`Không tìm thấy thương hiệu ${brandId}`);

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
    if (!brandId) throw new BadRequestException('brandId là bắt buộc');

    const brand = await this.brandRepo.findOne({ where: { id: brandId } });
    if (!brand) throw new NotFoundException(`Không tìm thấy thương hiệu ${brandId}`);

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
      throw new NotFoundException(`Không tìm thấy thương hiệu ${brandId}`);
    }
  }

  async deleteModel(modelId: number): Promise<void> {
    const result = await this.modelRepo.delete(modelId);
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy dòng xe ${modelId}`);
    }
  }
}
