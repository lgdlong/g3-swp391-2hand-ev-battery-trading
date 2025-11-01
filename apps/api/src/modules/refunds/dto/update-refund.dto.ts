import { PartialType } from '@nestjs/mapped-types';
import { CreateRefundDto } from './create-refund.dto';

export class UpdateRefundDto extends PartialType(CreateRefundDto) {}
