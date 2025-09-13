import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GeoService } from './geo.service';
import { CreateGeoDto } from './dto/create-geo.dto';
import { UpdateGeoDto } from './dto/update-geo.dto';

@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Post()
  create(@Body() createGeoDto: CreateGeoDto) {
    return this.geoService.create(createGeoDto);
  }

  @Get()
  findAll() {
    return this.geoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.geoService.findOne(+id);
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
