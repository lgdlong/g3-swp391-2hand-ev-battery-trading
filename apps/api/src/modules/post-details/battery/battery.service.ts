import { Injectable } from '@nestjs/common';
import { CreateBatteryDto } from './dto/create-battery.dto';
import { UpdateBatteryDto } from './dto/update-battery.dto';

@Injectable()
export class BatteryService {
  create(createBatteryDto: CreateBatteryDto) {
    return 'This action adds a new battery';
  }

  findAll() {
    return `This action returns all battery`;
  }

  findOne(id: number) {
    return `This action returns a #${id} battery`;
  }

  update(id: number, updateBatteryDto: UpdateBatteryDto) {
    return `This action updates a #${id} battery`;
  }

  remove(id: number) {
    return `This action removes a #${id} battery`;
  }
}
