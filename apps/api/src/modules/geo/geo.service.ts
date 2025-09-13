import { Injectable } from '@nestjs/common';
import { CreateGeoDto } from './dto/create-geo.dto';
import { UpdateGeoDto } from './dto/update-geo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from './entities/province.entity';
import { District } from './entities/district.entity';

@Injectable()
export class GeoService {
  constructor(
    @InjectRepository(Province) private provincesRepo : Repository<Province>,
    @InjectRepository(District) private districtRepo : Repository<District>,
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
    return 'find all ward';
  }

  findAllDistrict(){
    return 'find all district';
  }
  //////////////////////////////////////////////////////


  //////////////findbyid//////////////////////////////
  findOne(id: number) {
    return `This action returns a #${id} geo`;
  }

  async getDistrictsByProvinceId(provinceId: number){
    return this.districtRepo.find({
      where: { province_id: provinceId },
      order: { name: 'ASC'}
    })
  }

  update(id: number, updateGeoDto: UpdateGeoDto) {
    return `This action updates a #${id} geo`;
  }

  remove(id: number) {
    return `This action removes a #${id} geo`;
  }

  
}
