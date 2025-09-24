import { Injectable } from '@nestjs/common';
import { CreateBikeDto } from './dto/create-bike.dto';
import { UpdateBikeDto } from './dto/update-bike.dto';

@Injectable()
export class BikeService {
  create(createBikeDto: CreateBikeDto) {
    return 'This action adds a new bike';
  }

  findAll() {
    return `This action returns all bike`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bike`;
  }

  update(id: number, updateBikeDto: UpdateBikeDto) {
    return `This action updates a #${id} bike`;
  }

  remove(id: number) {
    return `This action removes a #${id} bike`;
  }
}
