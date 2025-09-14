import { Injectable } from '@nestjs/common';
import { CreateGeoDto } from './dto/create-geo.dto';
import { UpdateGeoDto } from './dto/update-geo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from './entities/province.entity';
import { District } from './entities/district.entity';
import { Ward } from './entities/ward.entity';

@Injectable()
export class GeoService {
  
  constructor(
    @InjectRepository(Province) private provincesRepo : Repository<Province>,
    @InjectRepository(District) private districtRepo : Repository<District>,
    @InjectRepository(Ward) private wardRepo : Repository<Ward>,
  ){}

  create(createGeoDto: CreateGeoDto) {
    return 'This action adds a new geo';
  }

  ////////////////////////find all///////////////////
  findAll() {
    return `This action returns all geo`;
  }
  
  findAllProvince() {
    return this.provincesRepo.find({order: {name: 'ASC'}})
  }

  findAllWard(){
    return this.wardRepo.find({ order: { name: 'ASC' } });
  }

  findAllDistrict(){
    return this.districtRepo.find({ order: { name: 'ASC' } });
  }

  //////////////findbyid//////////////////////////////
  async getDistrictsByProvinceId(provinceId: number){
    return this.districtRepo.find({
      where: { province: {id: provinceId}  },
      order: { name: 'ASC'}
    })
  }

  async getWardsbyDistrictId(districtId: number) {
    return this.wardRepo.find({
      where: { district: {id: districtId}  },
      order: { name: 'ASC'}
    })
  }

  async findProvinceById(provinceId: number){
    return this.provincesRepo.findOne({
      where: { id: provinceId }
    })
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


  update(id: number, updateGeoDto: UpdateGeoDto) {
    return `This action updates a #${id} geo`;
  }

  remove(id: number) {
    return `This action removes a #${id} geo`;
  }

  
}
