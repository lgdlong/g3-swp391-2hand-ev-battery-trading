import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, QueryFailedError, Repository } from 'typeorm';
import { BatteryBrand } from './entities/battery-brand.entity';
import { ListQueryDto } from '../../../shared/dto/list-query.dto';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { CreateBrandDto } from '../shared/dto/create-car-bike-catalog.dto';
import { LiteItem } from '../shared/interfaces/lite-item.interface';

@Injectable()
export class BatteryCatalogService {
  constructor(
    @InjectRepository(BatteryBrand) private readonly brandRepo: Repository<BatteryBrand>,
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

  // ======================================================
  // ============== CREATE (POST) ENDPOINTS ===============
  // ======================================================

  async createBrand(dto: CreateBrandDto): Promise<LiteItem> {
    try {
      const brand = this.brandRepo.create({ name: dto.name.trim() });
      const saved = await this.brandRepo.save(brand);
      return { id: saved.id, name: saved.name };
    } catch (err) {
      this.handleUniqueError(err, `Battery brand name '${dto.name}' already exists`);
    }
  }

  // ======================================================
  // ============== DELETE ENDPOINTS ======================
  // ======================================================

  async deleteBrand(id: number): Promise<void> {
    const result = await this.brandRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy thương hiệu pin với ID ${id}`);
    }
  }

  // ======================================================
  // ================= HELPER METHODS =====================
  // ======================================================

  private handleUniqueError(err: unknown, message: string): never {
    if (err instanceof QueryFailedError) {
      const pgErr = err.driverError as { code?: string };
      if (pgErr?.code === '23505') {
        throw new ConflictException(message);
      }
    }
    throw err;
  }
}
