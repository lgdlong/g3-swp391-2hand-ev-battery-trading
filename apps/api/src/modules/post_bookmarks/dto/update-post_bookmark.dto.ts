import { PartialType } from '@nestjs/mapped-types';
import { CreatePostBookmarkDto } from './create-post_bookmark.dto';

export class UpdatePostBookmarkDto extends PartialType(CreatePostBookmarkDto) {}
