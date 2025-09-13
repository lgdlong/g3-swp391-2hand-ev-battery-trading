import { PartialType } from '@nestjs/mapped-types';
import { CreateGeoDto } from './create-geo.dto';

export class UpdateGeoDto extends PartialType(CreateGeoDto) {}
