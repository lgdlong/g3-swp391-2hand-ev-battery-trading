import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BikeService } from './bike.service';
import { CreateBikeDto } from './dto/create-bike.dto';
import { UpdateBikeDto } from './dto/update-bike.dto';

@Controller('bike')
export class BikeController {
  constructor(private readonly bikeService: BikeService) {}

  @Post()
  create(@Body() createBikeDto: CreateBikeDto) {
    return this.bikeService.create(createBikeDto);
  }

  @Get()
  findAll() {
    return this.bikeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bikeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBikeDto: UpdateBikeDto) {
    return this.bikeService.update(+id, updateBikeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bikeService.remove(+id);
  }
}
