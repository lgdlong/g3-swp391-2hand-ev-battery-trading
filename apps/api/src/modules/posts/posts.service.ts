import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { PostType, PostStatus } from '../../shared/enums/post.enum';
import { BikeDetailsService } from '../post-details/services/bike-details.service';
import { Account } from '../accounts/entities/account.entity';
import { CreateCarPostDto } from './dto/car/create-post-car.dto';
import { CreateBikePostDto } from './dto/bike/create-post-bike.dto';
import { ListQueryDto } from 'src/shared/dto/list-query.dto';
import { PostMapper } from './mappers/post.mapper';
import { BasePostResponseDto } from './dto/base-post-response.dto';
import { PostImage } from './entities/post-image.entity';
import { CloudinaryService } from '../upload/cloudinary/cloudinary.service';
import { CreatePostImageDto } from './dto/create-post-image.dto';
import { PostImageResponseDto } from './dto/post-image-response.dto';
import { PostImageMapper } from './mappers/post-image.mapper';
import { AddressService } from '../address/address.service';
import { buildAddressText } from 'src/shared/helpers/address.helper';
import { CarDetailsService } from '../post-details/services/car-details.service';
import { DISPLAYABLE_POST_STATUS } from 'src/shared/constants/post';
import { PostReviewService } from '../post-review/post-review.service';
import { ReviewActionEnum } from 'src/shared/enums/review.enum';
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
    @InjectRepository(PostImage)
    private readonly imagesRepo: Repository<PostImage>,
    private readonly bikeDetailsService: BikeDetailsService,
    private readonly carDetailsService: CarDetailsService,
    private readonly addressService: AddressService,
    private readonly cloudinary: CloudinaryService,
    private readonly postReviewService: PostReviewService,
  ) {}

  async getCarPosts(query: ListQueryDto): Promise<BasePostResponseDto[]> {
    const rows = await this.postsRepo.find({
      where: {
        postType: PostType.EV_CAR,
        status: DISPLAYABLE_POST_STATUS, // Only return published posts
      },
      relations: ['carDetails', 'seller', 'images'],
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

    if (!dto.provinceNameCached && !dto.districtNameCached && !dto.wardNameCached) {
      const fullAddress = await this.addressService.getFullAddressByWardCode(dto.wardCode);
      dto.provinceNameCached = fullAddress.data.province.name;
      dto.districtNameCached = fullAddress.data.district.name;
      dto.wardNameCached = fullAddress.data.ward.name;
    }

    dto.addressTextCached =
      buildAddressText(
        dto.wardNameCached ?? undefined,
        dto.districtNameCached ?? undefined,
        dto.provinceNameCached ?? undefined,
      ) || '';

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

      // 2) Create car details
      if (dto.carDetails) {
        await this.carDetailsService.createWithTrx(trx, {
          post_id: savedPost.id,
          ...dto.carDetails,
        });
      }

      // 3) (tuỳ chọn) tự chuyển sang PENDING_REVIEW + log
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
      where: {
        postType: PostType.EV_BIKE,
        status: DISPLAYABLE_POST_STATUS, // Only return published posts
      },
      relations: ['bikeDetails', 'seller', 'images'],
      order: { createdAt: query.order || 'DESC' },
      take: query.limit,
      skip: query.offset,
    });
    return PostMapper.toBasePostResponseDtoArray(rows);
  }

  async searchPostsByTitle(
    searchQuery: string,
    query: ListQueryDto & { postType?: PostType; provinceNameCached?: string },
  ): Promise<BasePostResponseDto[]> {
    const where: any = {
      title: ILike(`%${searchQuery}%`),
      status: DISPLAYABLE_POST_STATUS, // Only search published posts
    };

    // Filter by postType if provided
    if (query.postType) {
      where.postType = query.postType;
    }

    // Filter by province if provided
    if (query.provinceNameCached) {
      where.provinceNameCached = query.provinceNameCached;
    }

    const rows = await this.postsRepo.find({
      where,
      relations: ['carDetails', 'bikeDetails', 'batteryDetails', 'seller', 'images'],
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
      if (dto.bikeDetails) {
        await this.bikeDetailsService.createWithTrx(trx, {
          post_id: savedPost.id,
          ...dto.bikeDetails,
        });
      }

      // 3) tạo Media (nếu có)
      // if (dto.media?.length) {
      //   const rows = dto.media.map((m) =>
      //     trx.create(PostMedia, {
      //       kind: m.kind,
      //       url: m.url,
      //       position: m.position ?? 0,
      //       post: savedPost,
      //     }),
      //   );
      //   await trx.save(PostMedia, rows);
      // }

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

  async addImages(postId: string, images: CreatePostImageDto[]) {
    if (!images?.length) return [];

    // đảm bảo post tồn tại (đơn giản, không transaction)
    const exists = await this.postsRepo.exists({ where: { id: postId } });
    if (!exists) throw new NotFoundException('Post not found');

    // lấy vị trí hiện tại để append (đơn giản)
    const last = await this.imagesRepo
      .createQueryBuilder('pi')
      .select('COALESCE(MAX(pi.position), 0)', 'max')
      .where('pi.post_id = :postId', { postId })
      .getRawOne<{ max: string }>();
    const basePos = Number(last?.max) || 0;

    const entities = images.map((img, idx) =>
      this.imagesRepo.create({
        post_id: postId,
        public_id: img.public_id,
        url: img.url,
        width: img.width,
        height: img.height,
        bytes: img.bytes,
        format: img.format ?? null,
        position: basePos + idx + 1,
      }),
    );

    try {
      // save mảng entity -> đơn giản, dễ đọc
      return await this.imagesRepo.save(entities);
    } catch (e: any) {
      if (e.code === '23505') {
        throw new BadRequestException(`public_id is already exists`);
      }
      throw e;
    }
  }

  async listImages(postId: string): Promise<PostImageResponseDto[]> {
    const images = await this.imagesRepo.find({
      where: { post_id: postId },
      order: { position: 'ASC', id: 'ASC' },
    });
    return PostImageMapper.toResponseDtoArray(images);
  }

  async getPostById(id: string): Promise<BasePostResponseDto> {
    const post = await this.postsRepo.findOne({
      where: { id },
      relations: ['seller', 'images', 'carDetails', 'bikeDetails'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return PostMapper.toBasePostResponseDto(post);
  }

  async getAllPostsForAdmin(
    query: ListQueryDto & { status?: string; postType?: string },
  ): Promise<BasePostResponseDto[]> {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.postType) {
      where.postType = query.postType;
    }

    const rows = await this.postsRepo.find({
      where,
      relations: ['carDetails', 'bikeDetails', 'seller', 'images'],
      order: { createdAt: query.order || 'DESC' },
      take: query.limit,
      skip: query.offset,
    });

    return PostMapper.toBasePostResponseDtoArray(rows);
  }

  /**
   * Approve a post (Admin only)
   */
  async approvePost(id: string): Promise<BasePostResponseDto> {
    const post = await this.postsRepo.findOne({
      where: { id: id },
      relations: ['seller', 'carDetails', 'bikeDetails', 'batteryDetails'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    post.status = DISPLAYABLE_POST_STATUS;
    post.reviewedAt = new Date();
    await this.postsRepo.save(post);

    return PostMapper.toBasePostResponseDto(post);
  }

  /**
   * Reject a post (Admin only)
   */
  async rejectPost(id: string, reason?: string): Promise<BasePostResponseDto> {
    const post = await this.postsRepo.findOne({
      where: { id: id },
      relations: ['seller', 'carDetails', 'bikeDetails', 'batteryDetails'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    const oldStatus = post.status;
    post.status = PostStatus.REJECTED;
    post.reviewedAt = new Date();
    await this.postsRepo.save(post);
    await this.postReviewService.create({
      postId: post.id,
      actorId: post.seller.id,
      oldStatus,
      newStatus: post.status,
      reason,
      action: ReviewActionEnum.REJECTED,
    });

    return PostMapper.toBasePostResponseDto(post);
  }
}
