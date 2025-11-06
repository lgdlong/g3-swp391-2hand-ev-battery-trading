import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { PostType, PostStatus } from '../../shared/enums/post.enum';
import { BikeDetailsService } from '../post-details/services/bike-details.service';
import { BatteryDetailsService } from '../post-details/services/battery-details.service';
import { Account } from '../accounts/entities/account.entity';
import { CreateCarPostDto } from './dto/car/create-post-car.dto';
import { CreateBikePostDto } from './dto/bike/create-post-bike.dto';
import { CreateBatteryPostDto } from './dto/battery/create-post-battery.dto';
import { ListQueryDto } from 'src/shared/dto/list-query.dto';
import { PostsQueryDto } from './dto/posts-query.dto';
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
import { DEFAULT_PAGE_SIZE } from 'src/shared/constants';
import { AdminListPostsQueryDto } from './dto/admin-query-post.dto';

// Union type for all post creation DTOs
type CreateAnyPostDto = CreateCarPostDto | CreateBikePostDto | CreateBatteryPostDto;

@Injectable()
export class PostsService {
  // Relation constants
  private readonly CAR_DETAILS = 'carDetails';
  private readonly BIKE_DETAILS = 'bikeDetails';
  private readonly BATTERY_DETAILS = 'batteryDetails';
  private readonly SELLER = 'seller';
  private readonly IMAGES = 'images';
  private readonly VERIFICATION_REQUEST = 'verificationRequest';
  private readonly POST_FULL_RELATIONS = [
    this.CAR_DETAILS,
    this.BIKE_DETAILS,
    this.BATTERY_DETAILS,
    this.SELLER,
    this.IMAGES,
    this.VERIFICATION_REQUEST,
  ];

  constructor(
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
    @InjectRepository(PostImage)
    private readonly imagesRepo: Repository<PostImage>,
    private readonly bikeDetailsService: BikeDetailsService,
    private readonly carDetailsService: CarDetailsService,
    private readonly batteryDetailsService: BatteryDetailsService,
    private readonly addressService: AddressService,
    private readonly cloudinary: CloudinaryService,
    private readonly postReviewService: PostReviewService,
  ) {}

  async countPosts(status?: string): Promise<{ count: number; status?: string }> {
    const queryBuilder = this.postsRepo.createQueryBuilder('post');

    if (status) {
      // Cast enum to text before applying UPPER for PostgreSQL compatibility
      queryBuilder.where('UPPER(post.status::text) = UPPER(:status)', { status });
    }

    const count = await queryBuilder.getCount();
    return { count, status };
  }

  /**
   * Generic method to create any type of post (car, bike, or battery)
   * Eliminates code duplication across createCarPost, createBikePost, and createBatteryPost
   */
  private async createPost(
    dto: CreateAnyPostDto,
    sellerId: number,
  ): Promise<BasePostResponseDto | null> {
    // Validate postType matches the DTO
    if (
      (dto instanceof CreateCarPostDto && dto.postType !== PostType.EV_CAR) ||
      (dto instanceof CreateBikePostDto && dto.postType !== PostType.EV_BIKE) ||
      (dto instanceof CreateBatteryPostDto && dto.postType !== PostType.BATTERY)
    ) {
      throw new Error('Invalid postType for this endpoint');
    }

    // Fetch address names if not provided
    if (!dto.provinceNameCached && !dto.districtNameCached && !dto.wardNameCached) {
      const fullAddress = await this.addressService.getFullAddressByWardCode(dto.wardCode);
      dto.provinceNameCached = fullAddress.data.province.name;
      dto.districtNameCached = fullAddress.data.district.name;
      dto.wardNameCached = fullAddress.data.ward.name;
    }

    // Build address text for caching
    dto.addressTextCached =
      buildAddressText(
        dto.wardNameCached ?? undefined,
        dto.districtNameCached ?? undefined,
        dto.provinceNameCached ?? undefined,
      ) || '';

    return this.postsRepo.manager.transaction(async (trx) => {
      // 1) Create Post entity
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
        status: dto.status ?? PostStatus.PENDING_REVIEW,
      });
      const savedPost = await trx.save(Post, post);

      // 2) Create post-specific details based on postType
      switch (dto.postType) {
        case PostType.EV_CAR:
          if ('carDetails' in dto && dto.carDetails) {
            await this.carDetailsService.createWithTrx(trx, {
              post_id: savedPost.id,
              ...dto.carDetails,
            });
          }
          break;

        case PostType.EV_BIKE:
          if ('bikeDetails' in dto && dto.bikeDetails) {
            await this.bikeDetailsService.createWithTrx(trx, {
              post_id: savedPost.id,
              ...dto.bikeDetails,
            });
          }
          break;

        case PostType.BATTERY:
          if ('batteryDetails' in dto && dto.batteryDetails) {
            await this.batteryDetailsService.createWithTrx(trx, {
              post_id: savedPost.id,
              ...dto.batteryDetails,
            });
          }
          break;

        default:
          // TypeScript exhaustiveness check - this should never be reached
          throw new Error('Unsupported postType');
      }

      // 3) Fetch created post with appropriate relations based on postType
      const relations: string[] = [this.SELLER];
      switch (dto.postType) {
        case PostType.EV_CAR:
          relations.push(this.CAR_DETAILS);
          break;
        case PostType.EV_BIKE:
          relations.push(this.BIKE_DETAILS);
          break;
        case PostType.BATTERY:
          relations.push(this.BATTERY_DETAILS);
          break;
      }

      const createdPost = await trx.findOne(Post, {
        where: { id: savedPost.id },
        relations,
      });

      return createdPost ? PostMapper.toBasePostResponseDto(createdPost) : null;
    });
  }

  async getCarPosts(query: ListQueryDto): Promise<BasePostResponseDto[]> {
    const rows = await this.postsRepo.find({
      where: {
        postType: PostType.EV_CAR,
        status: DISPLAYABLE_POST_STATUS, // Only return published posts
      },
      relations: [this.CAR_DETAILS, this.SELLER, this.IMAGES, this.VERIFICATION_REQUEST],
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
    return this.createPost(dto, sellerId);
  }

  async getBikePosts(query: ListQueryDto): Promise<BasePostResponseDto[]> {
    const rows = await this.postsRepo.find({
      where: {
        postType: PostType.EV_BIKE,
        status: DISPLAYABLE_POST_STATUS, // Only return published posts
      },
      relations: [this.BIKE_DETAILS, this.SELLER, this.IMAGES, this.VERIFICATION_REQUEST],
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
    // ✅ Sanitize search query to prevent SQL injection
    const sanitizedQuery = searchQuery.replace(/['"\\%_]/g, '\\$&');

    // ✅ Properly typed where clause instead of 'any'
    const where: {
      title: any;
      status: PostStatus;
      postType?: PostType;
      provinceNameCached?: string;
    } = {
      title: ILike(`%${sanitizedQuery}%`),
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
      relations: this.POST_FULL_RELATIONS,
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
    return this.createPost(dto, sellerId);
  }

  async getBatteryPosts(query: ListQueryDto): Promise<BasePostResponseDto[]> {
    const rows = await this.postsRepo.find({
      where: {
        postType: PostType.BATTERY,
        status: DISPLAYABLE_POST_STATUS,
      },
      relations: [this.BATTERY_DETAILS, this.SELLER, this.IMAGES, this.VERIFICATION_REQUEST],
      order: { createdAt: query.order || 'DESC' },
      take: query.limit,
      skip: query.offset,
    });
    return PostMapper.toBasePostResponseDtoArray(rows);
  }

  async createBatteryPost(
    dto: CreateBatteryPostDto,
    sellerId: number,
  ): Promise<BasePostResponseDto | null> {
    return this.createPost(dto, sellerId);
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

  async getPostsByUserId(userId: number, query: PostsQueryDto): Promise<BasePostResponseDto[]> {
    const where: any = {
      seller: { id: userId },
    };

    // Add status filter if provided
    if (query.status) {
      where.status = query.status;
    }

    // Add search query if provided
    if (query.q) {
      where.title = ILike(`%${query.q}%`);
    }

    // Calculate offset from page if page is provided instead of offset
    let offset = query.offset || 0;
    if (query.page && query.page > 1) {
      offset = (query.page - 1) * (query.limit || DEFAULT_PAGE_SIZE);
    }

    // Determine sort field and order
    const orderField = query.sort || 'createdAt';
    const orderDirection = query.order || 'DESC';
    const orderBy: Record<string, 'ASC' | 'DESC'> = {};
    orderBy[orderField] = orderDirection;

    const rows = await this.postsRepo.find({
      where,
      relations: this.POST_FULL_RELATIONS,
      order: orderBy,
      take: query.limit || DEFAULT_PAGE_SIZE,
      skip: offset,
    });

    return PostMapper.toBasePostResponseDtoArray(rows);
  }

  async getPostById(id: string): Promise<BasePostResponseDto> {
    const post = await this.postsRepo.findOne({
      where: { id },
      relations: this.POST_FULL_RELATIONS,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return PostMapper.toBasePostResponseDto(post);
  }

  async getAllPostsForAdmin(query: AdminListPostsQueryDto): Promise<{
    data: BasePostResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const where: any = {};

    if (query.status) {
      //  Chỉ cho phép admin status
      const allowedAdminStatuses = [
        'DRAFT',
        'PENDING_REVIEW',
        'PUBLISHED',
        'REJECTED',
        'PAUSED',
        'SOLD',
        'ARCHIVED',
      ];
      if (allowedAdminStatuses.includes(query.status)) {
        where.status = query.status;
      } else {
        throw new BadRequestException(`Invalid status value: ${query.status}`);
      }
    }

    if (query.postType) {
      where.postType = query.postType;
    }

    // Get total count for pagination
    const total = await this.postsRepo.count({ where });

    const rows = await this.postsRepo.find({
      where,
      relations: this.POST_FULL_RELATIONS,
      order: { createdAt: query.order === 'ASC' ? 'ASC' : 'DESC' },
      take: query.limit,
      skip: query.offset,
    });

    const page = query.offset ? Math.floor(query.offset / (query.limit || 20)) + 1 : 1;
    const limit = query.limit || 20;
    const totalPages = Math.ceil(total / limit);

    return {
      data: PostMapper.toBasePostResponseDtoArray(rows),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Approve a post (Admin only)
   */
  async approvePost(id: string): Promise<BasePostResponseDto> {
    const post = await this.postsRepo.findOne({
      where: { id: id },
      relations: this.POST_FULL_RELATIONS,
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
      relations: this.POST_FULL_RELATIONS,
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Only allow rejecting posts that are in PENDING_REVIEW status
    if (post.status !== PostStatus.PENDING_REVIEW) {
      throw new BadRequestException(
        `Cannot reject post with status ${post.status}. Only posts with PENDING_REVIEW status can be rejected.`,
      );
    }

    const oldStatus = post.status;
    post.status = PostStatus.REJECTED;
    post.reviewedAt = new Date();
    await this.postsRepo.save(post);
    await this.postReviewService.create({
      postId: post.id,
      actorId: String(post.seller.id),
      oldStatus,
      newStatus: post.status,
      reason,
      action: ReviewActionEnum.REJECTED,
    });

    return PostMapper.toBasePostResponseDto(post);
  }

  async deletePostById(id: string, userId: number): Promise<Date> {
    const post = await this.postsRepo.findOne({
      where: { id, seller: { id: userId } },
      relations: [this.SELLER],
    });

    if (!post) {
      throw new NotFoundException('Post not found or you do not have permission to delete it');
    }

    const deletedAt = new Date();
    await this.postsRepo.softDelete(id);

    return deletedAt;
  }

  /**
   * Update a post by user (only allows updating their own posts)
   * Only allows updating posts in DRAFT or REJECTED status
   */
  async updateMyPostById(
    id: string,
    userId: number,
    updateDto: Partial<CreateAnyPostDto>,
  ): Promise<BasePostResponseDto> {
    const post = await this.postsRepo.findOne({
      where: { id, seller: { id: userId } },
      relations: this.POST_FULL_RELATIONS,
    });

    if (!post) {
      throw new NotFoundException('Post not found or you do not have permission to update it');
    }

    // Allow updating status from PUBLISHED to SOLD (only status field)
    const isOnlyStatusUpdate =
      post.status === PostStatus.PUBLISHED &&
      updateDto.status === PostStatus.SOLD &&
      Object.keys(updateDto).filter((key) => updateDto[key as keyof typeof updateDto] !== undefined).length === 1 &&
      updateDto.status !== undefined;

    // Only allow updating posts in DRAFT or REJECTED status, or PUBLISHED -> SOLD status update
    if (
      post.status !== PostStatus.DRAFT &&
      post.status !== PostStatus.REJECTED &&
      !isOnlyStatusUpdate
    ) {
      throw new BadRequestException(
        `Cannot update post with status ${post.status}. Only DRAFT or REJECTED posts can be updated, or PUBLISHED posts can be marked as SOLD.`,
      );
    }

    return this.postsRepo.manager.transaction(async (trx) => {
      // Update basic post fields
      const updateFields: Partial<Post> = {};

      if (updateDto.title !== undefined) updateFields.title = updateDto.title;
      if (updateDto.description !== undefined) updateFields.description = updateDto.description;
      if (updateDto.priceVnd !== undefined) updateFields.priceVnd = updateDto.priceVnd;
      if (updateDto.isNegotiable !== undefined) updateFields.isNegotiable = updateDto.isNegotiable;

      // Handle status updates
      if (updateDto.status !== undefined) {
        updateFields.status = updateDto.status;
        // Clear reviewedAt when changing to PENDING_REVIEW
        if (updateDto.status === PostStatus.PENDING_REVIEW) {
          updateFields.reviewedAt = null;
        }
      }

      // Handle address updates
      if (updateDto.wardCode) {
        updateFields.wardCode = updateDto.wardCode;

        // Fetch and cache address information
        try {
          const fullAddress = await this.addressService.getFullAddressByWardCode(
            updateDto.wardCode,
          );
          updateFields.provinceNameCached = fullAddress.data.province.name;
          updateFields.districtNameCached = fullAddress.data.district.name;
          updateFields.wardNameCached = fullAddress.data.ward.name;

          // If addressTextCached is not set, build it from the fetched address components
          if (!updateFields.addressTextCached) {
            updateFields.addressTextCached = buildAddressText(
              fullAddress.data.ward.name,
              fullAddress.data.district.name,
              fullAddress.data.province.name,
            );
          }
        } catch {
          // If address service fails, use provided cached values
          if (updateDto.provinceNameCached)
            updateFields.provinceNameCached = updateDto.provinceNameCached;
          if (updateDto.districtNameCached)
            updateFields.districtNameCached = updateDto.districtNameCached;
          if (updateDto.wardNameCached) updateFields.wardNameCached = updateDto.wardNameCached;
        }
      }

      if (updateDto.addressTextCached !== undefined)
        updateFields.addressTextCached = updateDto.addressTextCached;

      // If status is REJECTED and no new status is provided, change it back to DRAFT when updating
      if (post.status === PostStatus.REJECTED && updateDto.status === undefined) {
        updateFields.status = PostStatus.DRAFT;
        updateFields.reviewedAt = null;
      }

      // Update the post
      if (Object.keys(updateFields).length > 0) {
        await trx.update(Post, { id }, updateFields);
      }

      // Update post-specific details based on postType
      switch (post.postType) {
        case PostType.EV_CAR:
          if ('carDetails' in updateDto && updateDto.carDetails) {
            await this.carDetailsService.updateWithTrx(trx, id, updateDto.carDetails);
          }
          break;

        case PostType.EV_BIKE:
          if ('bikeDetails' in updateDto && updateDto.bikeDetails) {
            await this.bikeDetailsService.updateWithTrx(trx, id, updateDto.bikeDetails);
          }
          break;

        case PostType.BATTERY:
          if ('batteryDetails' in updateDto && updateDto.batteryDetails) {
            await this.batteryDetailsService.updateWithTrx(trx, id, updateDto.batteryDetails);
          }
          break;
      }

      // Fetch and return the updated post
      const updatedPost = await trx.findOne(Post, {
        where: { id },
        relations: this.POST_FULL_RELATIONS,
      });

      return PostMapper.toBasePostResponseDto(updatedPost!);
    });
  }
}
