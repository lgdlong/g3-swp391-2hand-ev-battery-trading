import { PartialType } from '@nestjs/swagger';
import { CreatePostLifecycleDto } from './create-post-lifecycle.dto';

export class UpdatePostLifecycleDto extends PartialType(CreatePostLifecycleDto) {}
