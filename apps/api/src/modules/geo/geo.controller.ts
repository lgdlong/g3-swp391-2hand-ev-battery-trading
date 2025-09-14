import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { GeoService } from './geo.service';
import { CreateGeoDto } from './dto/create-geo.dto';
import { UpdateGeoDto } from './dto/update-geo.dto';
import { number } from 'joi';

@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Post()
  create(@Body() createGeoDto: CreateGeoDto) {
    return this.geoService.create(createGeoDto);
  }

  //////////////////findall/////////////////
  @Get()
  findAll() {
    return this.geoService.findAll();
  }

  @Get('provinces')
  findAllProvince(){
    return this.geoService.findAllProvince();
  }

  @Get('wards')
  findAllWard(){
    return this.geoService.findAllWard();
  }

  @Get('districts')
  findAllDistrict(){
    return this.geoService.findAllDistrict();
  }

  ///////////////findbyid///////////////////

  //ParseIntPipe giup chuyen doi tu string den number va tra loi 400/404 thay vi 500 (loi nguy hiem de bi pha)
  @Get('province/:id/districts')
  getDistrictsByProvinceId(@Param('id', ParseIntPipe) id: number){
    return this.geoService.getDistrictsByProvinceId(id)
  }

  @Get('district/:id/wards')
  getWardsbyDistrictId(@Param('id', ParseIntPipe) id: number){
    return this.geoService.getWardsbyDistrictId(id)
  }

  @Get('province/:id/')
  findProvince(@Param('id', ParseIntPipe) id: number){
    return this.geoService.findProvinceById(id)
  }

  @Get('district/:id/')
  findDistrict(@Param('id', ParseIntPipe) id: number){
    return this.geoService.findDistrictById(+id)
  }

  @Get('ward/:id/')
  findWard(@Param('id', ParseIntPipe) id: number){
    return this.geoService.findWardById(id)
  }




  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGeoDto: UpdateGeoDto) {
    return this.geoService.update(+id, updateGeoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.geoService.remove(+id);
  }
}
