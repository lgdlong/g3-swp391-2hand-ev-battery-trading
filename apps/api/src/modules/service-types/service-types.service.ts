import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceType } from './entities/service-type.entity';
import { CreateServiceTypeDto, UpdateServiceTypeDto } from './dto';

@Injectable()
export class ServiceTypesService {
  constructor(
    @InjectRepository(ServiceType)
    private readonly serviceTypeRepo: Repository<ServiceType>,
  ) {}

  async findByCode(code: string): Promise<ServiceType | null> {
    return this.serviceTypeRepo.findOne({ where: { code, isActive: true } });
  }

  /**
   * Find or create service type by code
   * Auto-creates if not exists with default name and description
   */
  async findOrCreateByCode(code: string, name?: string, description?: string): Promise<ServiceType> {
    let serviceType = await this.serviceTypeRepo.findOne({ where: { code } });

    if (!serviceType) {
      serviceType = this.serviceTypeRepo.create({
        code,
        name: name || code,
        description: description || `Service type: ${code}`,
        isActive: true,
      });
      await this.serviceTypeRepo.save(serviceType);
    }

    return serviceType;
  }

  async findAll(): Promise<ServiceType[]> {
    return this.serviceTypeRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<ServiceType> {
    const serviceType = await this.serviceTypeRepo.findOne({ where: { id } });
    if (!serviceType) {
      throw new NotFoundException(`Service type with ID ${id} not found`);
    }
    return serviceType;
  }

  async create(createServiceTypeDto: CreateServiceTypeDto): Promise<ServiceType> {
    // Check if code already exists
    const existingServiceType = await this.serviceTypeRepo.findOne({
      where: { code: createServiceTypeDto.code },
    });

    if (existingServiceType) {
      throw new ConflictException(
        `Service type with code '${createServiceTypeDto.code}' already exists`,
      );
    }

    const serviceType = this.serviceTypeRepo.create({
      ...createServiceTypeDto,
      isActive: createServiceTypeDto.isActive ?? true,
    });

    return this.serviceTypeRepo.save(serviceType);
  }

  async update(id: number, updateServiceTypeDto: UpdateServiceTypeDto): Promise<ServiceType> {
    const serviceType = await this.findOne(id);

    // If updating code, check for conflicts
    if (updateServiceTypeDto.code && updateServiceTypeDto.code !== serviceType.code) {
      const existingServiceType = await this.serviceTypeRepo.findOne({
        where: { code: updateServiceTypeDto.code },
      });

      if (existingServiceType) {
        throw new ConflictException(
          `Service type with code '${updateServiceTypeDto.code}' already exists`,
        );
      }
    }

    Object.assign(serviceType, updateServiceTypeDto);
    return this.serviceTypeRepo.save(serviceType);
  }

  async remove(id: number): Promise<void> {
    const serviceType = await this.findOne(id);
    await this.serviceTypeRepo.remove(serviceType);
  }

  async toggleActive(id: number): Promise<ServiceType> {
    const serviceType = await this.findOne(id);
    serviceType.isActive = !serviceType.isActive;
    return this.serviceTypeRepo.save(serviceType);
  }
}
