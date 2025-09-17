import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VehicleColorsService } from './vehicle-colors.service';
import { CreateVehicleColorDto } from './dto/create-vehicle-color.dto';
import { UpdateVehicleColorDto } from './dto/update-vehicle-color.dto';

@Controller('vehicle-colors')
export class VehicleColorsController {
  constructor(private readonly vehicleColorsService: VehicleColorsService) {}

  @Post()
  create(@Body() createVehicleColorDto: CreateVehicleColorDto) {
    return this.vehicleColorsService.create(createVehicleColorDto);
  }

  @Get()
  findAll() {
    return this.vehicleColorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehicleColorsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVehicleColorDto: UpdateVehicleColorDto) {
    return this.vehicleColorsService.update(+id, updateVehicleColorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehicleColorsService.remove(+id);
  }
}
