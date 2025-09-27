import { PartialType } from '@nestjs/mapped-types';
import { BaseCreatePostDto } from './base-create-post.dto';

export class UpdatePostDto extends PartialType(BaseCreatePostDto) {}
