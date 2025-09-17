import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleColorDto } from './create-vehicle-color.dto';

export class UpdateVehicleColorDto extends PartialType(CreateVehicleColorDto) {}
