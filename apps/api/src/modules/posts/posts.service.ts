import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';
import { PostType } from '../../shared/enums/post.enum';
import { PostMedia } from './entities/post-media.entity';
import { CarDetailsService } from '../post-details/services/car-details.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
    @InjectRepository(PostMedia) private readonly mediaRepo: Repository<PostMedia>,
    private readonly carDetailsService: CarDetailsService,
  ) {}

  async createCarPost(dto: CreatePostDto) {
    if (dto.postType !== PostType.EV_CAR) {
      throw new Error('Invalid postType for this endpoint');
    }

    return this.postsRepo.manager.transaction(async (trx) => {
      // 1) tạo Post
      const post = trx.create(Post, {
        // nếu bạn map seller bằng ManyToOne đối tượng:
        seller: { id: dto.sellerId } as any,
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
        ...dto.details,
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
      return trx.findOne(Post, {
        where: { id: savedPost.id },
        relations: ['carDetails', 'bikeDetails', 'batteryDetails'],
      });
    });
  }
}
