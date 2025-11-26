import { AccountMapper } from 'src/modules/accounts/mappers';
import { PostRatings } from '../entities/post-ratings.entity';
import { SafeAccountDto } from 'src/modules/accounts/dto/safe-account.dto';

export interface SafePostInfo {
  id: string;
  title: string;
  priceVnd: string;
}

export interface SafePostRatingDto {
  id: string;
  postId: string | number;
  rating: number;
  content: string | null;
  createdAt: Date;
  customer: SafeAccountDto | null;
  seller?: SafeAccountDto | null;
  post?: SafePostInfo | null;
}

export class PostRatingMapper {
  static toSafeDto(entity: PostRatings): SafePostRatingDto {
    const postEntity = entity.post as any;
    return {
      id: entity.id,
      postId: postEntity?.id ?? null,
      rating: entity.rating,
      content: entity.content ?? null,
      createdAt: entity.createdAt,
      customer: entity.customer ? AccountMapper.toSafeDto(entity.customer) : null,
      seller: postEntity?.seller ? AccountMapper.toSafeDto(postEntity.seller) : null,
      post: postEntity
        ? {
            id: postEntity.id,
            title: postEntity.title ?? '',
            priceVnd: postEntity.priceVnd ?? '0',
          }
        : null,
    };
  }

  static toSafeDtoArray(entities: PostRatings[]): SafePostRatingDto[] {
    return entities.map((r) => PostRatingMapper.toSafeDto(r));
  }
}
