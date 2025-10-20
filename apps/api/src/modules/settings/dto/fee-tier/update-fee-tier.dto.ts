import { PartialType } from '@nestjs/swagger';
import { CreateFeeTierDto } from './create-fee-tier.dto';

export class UpdateFeeTierDto extends PartialType(CreateFeeTierDto) {}
