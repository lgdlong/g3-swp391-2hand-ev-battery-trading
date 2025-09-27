import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { PostType } from '../../shared/enums/post.enum';
import { PostMedia } from './entities/post-media.entity';
import { CarDetailsService } from '../post-details/services/car-details.service';
import { BikeDetailsService } from '../post-details/services/bike-details.service';
import { Account } from '../accounts/entities/account.entity';
import { CreateCarPostDto } from './dto/car/create-post-car.dto';
import { CreateBikePostDto } from './dto/bike/create-post-bike.dto';
import { ListQueryDto } from 'src/shared/dto/list-query.dto';
import { PostMapper } from './mappers/post.mapper';
import { BasePostResponseDto } from './dto/base-post-response.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
    // @InjectRepository(PostMedia)
    // private readonly mediaRepo: Repository<PostMedia>,
    private readonly carDetailsService: CarDetailsService,
    private readonly bikeDetailsService: BikeDetailsService,
  ) {}

  async getCarPosts(query: ListQueryDto): Promise<BasePostResponseDto[]> {
    const rows = await this.postsRepo.find({
      where: { postType: PostType.EV_CAR },
      relations: ['carDetails', 'seller'],
      order: { createdAt: query.order || 'DESC' },
      take: query.limit,
      skip: query.offset,
    });
    return PostMapper.toBasePostResponseDtoArray(rows);
  }

  async createCarPost(
    dto: CreateCarPostDto,
    sellerId: number,
  ): Promise<BasePostResponseDto | null> {
    if (dto.postType !== PostType.EV_CAR) {
      throw new Error('Invalid postType for this endpoint');
    }

    return this.postsRepo.manager.transaction(async (trx) => {
      // 1) tạo Post
      const post = trx.create(Post, {
        // nếu bạn map seller bằng ManyToOne đối tượng:
        seller: { id: sellerId } as Account,
        postType: dto.postType,
        title: dto.title,
        description: dto.description,
        wardCode: dto.wardCode,
        provinceNameCached: dto.provinceNameCached ?? null,
        districtNameCached: dto.districtNameCached ?? null,
        wardNameCached: dto.wardNameCached ?? null,
        addressTextCached: dto.addressTextCached ?? null,
        priceVnd: dto.priceVnd,
        isNegotiable: dto.isNegotiable ?? false,
      });
      const savedPost = await trx.save(Post, post);

      // 2) tạo Car Details
      await this.carDetailsService.createWithTrx(trx, {
        post_id: savedPost.id,
        ...dto.carDetails,
      });

      // 3) tạo Media (nếu có)
      if (dto.media?.length) {
        const rows = dto.media.map((m) =>
          trx.create(PostMedia, {
            kind: m.kind,
            url: m.url,
            position: m.position ?? 0,
            post: savedPost,
          }),
        );
        await trx.save(PostMedia, rows);
      }

      // 4) (tuỳ chọn) tự chuyển sang PENDING_REVIEW + log
      // await trx.update(Post, { id: savedPost.id }, { status: PostStatus.PENDING_REVIEW, submittedAt: new Date() });
      // await trx.save(PostReviewLog, trx.create(PostReviewLog, { post: savedPost, action: ReviewActionEnum.SUBMITTED, actor: {id: dto.sellerId} as any, oldStatus: PostStatus.DRAFT, newStatus: PostStatus.PENDING_REVIEW }));

      // 5) trả về Post + relations
      const createdPost = await trx.findOne(Post, {
        where: { id: savedPost.id },
        relations: ['carDetails', 'seller'],
      });

      return createdPost ? PostMapper.toBasePostResponseDto(createdPost) : null;
    });
  }

  async getBikePosts(query: ListQueryDto): Promise<BasePostResponseDto[]> {
    const rows = await this.postsRepo.find({
      where: { postType: PostType.EV_BIKE },
      relations: ['bikeDetails', 'seller'],
      order: { createdAt: query.order || 'DESC' },
      take: query.limit,
      skip: query.offset,
    });
    return PostMapper.toBasePostResponseDtoArray(rows);
  }

  async createBikePost(
    dto: CreateBikePostDto,
    sellerId: number,
  ): Promise<BasePostResponseDto | null> {
    if (dto.postType !== PostType.EV_BIKE) {
      throw new Error('Invalid postType for this endpoint');
    }

    return this.postsRepo.manager.transaction(async (trx) => {
      // 1) tạo Post
      const post = trx.create(Post, {
        seller: { id: sellerId } as Account,
        postType: dto.postType,
        title: dto.title,
        description: dto.description,
        wardCode: dto.wardCode,
        provinceNameCached: dto.provinceNameCached ?? null,
        districtNameCached: dto.districtNameCached ?? null,
        wardNameCached: dto.wardNameCached ?? null,
        addressTextCached: dto.addressTextCached ?? null,
        priceVnd: dto.priceVnd,
        isNegotiable: dto.isNegotiable ?? false,
      });
      const savedPost = await trx.save(Post, post);

      // 2) tạo Bike Details
      await this.bikeDetailsService.createWithTrx(trx, {
        post_id: savedPost.id,
        ...dto.bikeDetails,
      });

      // 3) tạo Media (nếu có)
      if (dto.media?.length) {
        const rows = dto.media.map((m) =>
          trx.create(PostMedia, {
            kind: m.kind,
            url: m.url,
            position: m.position ?? 0,
            post: savedPost,
          }),
        );
        await trx.save(PostMedia, rows);
      }

      // 4) (optional) cập nhật status/log như createCarPost nếu cần
      // ...

      // 5) trả về Post + relations, rồi map DTO giống createCarPost
      const createdPost = await trx.findOne(Post, {
        where: { id: savedPost.id },
        relations: ['bikeDetails', 'seller'],
      });

      return createdPost ? PostMapper.toBasePostResponseDto(createdPost) : null;
    });
  }
}
