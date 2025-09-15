import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GeoService } from './geo.service';

@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('provinces')
  findAllProvince() {
    return this.geoService.findAllProvince();
  }

  @Get('wards')
  findAllWard() {
    return this.geoService.findAllWard();
  }

  @Get('districts')
  findAllDistrict() {
    return this.geoService.findAllDistrict();
  }

  ///////////////findbyid///////////////////

  //ParseIntPipe giup chuyen doi tu string den number va tra loi 400/404 thay vi 500 (loi nguy hiem de bi pha)
  @Get('province/:id/districts')
  getDistrictsByProvinceId(@Param('id', ParseIntPipe) id: number) {
    return this.geoService.getDistrictsByProvinceId(id);
  }

  @Get('district/:id/wards')
  getWardsByDistrictId(@Param('id', ParseIntPipe) id: number) {
    return this.geoService.getWardsByDistrictId(id);
  }

  @Get('province/:id/')
  findProvince(@Param('id', ParseIntPipe) id: number) {
    return this.geoService.findProvinceById(id);
  }

  @Get('district/:id/')
  findDistrict(@Param('id', ParseIntPipe) id: number) {
    return this.geoService.findDistrictById(+id);
  }

  @Get('ward/:id/')
  findWard(@Param('id', ParseIntPipe) id: number) {
    return this.geoService.findWardById(id);
  }
}
