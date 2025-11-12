import { AccountMapper } from 'src/modules/accounts/mappers';
import { PostRatings } from '../entities/post-ratings.entity';
import { SafeAccountDto } from 'src/modules/accounts/dto/safe-account.dto';

export interface SafePostRatingDto {
  id: string;
  postId: string | number;
  rating: number;
  content: string | null;
  createdAt: Date;
  customer: SafeAccountDto | null;
  seller?: SafeAccountDto | null;
}

export class PostRatingMapper {
  static toSafeDto(entity: PostRatings): SafePostRatingDto {
    return {
      id: entity.id,
      postId: (entity.post as any)?.id ?? null,
      rating: entity.rating,
      content: entity.content ?? null,
      createdAt: entity.createdAt,
      customer: entity.customer ? AccountMapper.toSafeDto(entity.customer) : null,
      seller: (entity.post as any)?.seller ? AccountMapper.toSafeDto((entity.post as any).seller) : null,
    };
  }

  static toSafeDtoArray(entities: PostRatings[]): SafePostRatingDto[] {
    return entities.map((r) => PostRatingMapper.toSafeDto(r));
  }
}
