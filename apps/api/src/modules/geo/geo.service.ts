import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from './entities/province.entity';
import { District } from './entities/district.entity';
import { Ward } from './entities/ward.entity';

@Injectable()
export class GeoService {
  constructor(
    @InjectRepository(Province) private provincesRepo: Repository<Province>,
    @InjectRepository(District) private districtRepo: Repository<District>,
    @InjectRepository(Ward) private wardRepo: Repository<Ward>,
  ) {}

  findAllProvince() {
    return this.provincesRepo.find({ order: { name: 'ASC' } });
  }

  findAllWard() {
    return this.wardRepo.find({ order: { name: 'ASC' } });
  }

  findAllDistrict() {
    return this.districtRepo.find({ order: { name: 'ASC' } });
  }

  //////////////findbyid//////////////////////////////
  async getDistrictsByProvinceId(provinceId: number) {
    return this.districtRepo.find({
      where: { province: { id: provinceId } },
      order: { name: 'ASC' },
    });
  }

  async getWardsByDistrictId(districtId: number) {
    return this.wardRepo.find({
      where: { district: { id: districtId } },
      order: { name: 'ASC' },
    });
  }

  async findProvinceById(provinceId: number) {
    return this.provincesRepo.findOne({
      where: { id: provinceId },
    });
  }

  async findDistrictById(districtId: number) {
    return this.districtRepo.findOne({
      where: { id: districtId },
    });
  }

  async findWardById(wardId: number) {
    return this.wardRepo.findOne({
      where: { id: wardId },
    });
  }
}
