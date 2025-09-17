import { PartialType } from '@nestjs/mapped-types';
import { CreatePostMediaDto } from './create-post-media.dto';

export class UpdatePostMediaDto extends PartialType(CreatePostMediaDto) {}
