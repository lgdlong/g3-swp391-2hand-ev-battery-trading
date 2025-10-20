import { PartialType } from '@nestjs/swagger';
import { CreatePostRatingDto } from './create-post-rating.dto';

export class UpdatePostRatingDto extends PartialType(CreatePostRatingDto) {}
