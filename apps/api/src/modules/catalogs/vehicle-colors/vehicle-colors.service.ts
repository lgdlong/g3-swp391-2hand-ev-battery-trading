import { Injectable } from '@nestjs/common';
import { CreateVehicleColorDto } from './dto/create-vehicle-color.dto';
import { UpdateVehicleColorDto } from './dto/update-vehicle-color.dto';

@Injectable()
export class VehicleColorsService {
  create(createVehicleColorDto: CreateVehicleColorDto) {
    return 'This action adds a new vehicleColor';
  }

  findAll() {
    return `This action returns all vehicleColors`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vehicleColor`;
  }

  update(id: number, updateVehicleColorDto: UpdateVehicleColorDto) {
    return `This action updates a #${id} vehicleColor`;
  }

  remove(id: number) {
    return `This action removes a #${id} vehicleColor`;
  }
}
