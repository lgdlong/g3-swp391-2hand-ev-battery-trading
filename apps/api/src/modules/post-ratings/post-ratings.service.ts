import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostRatings } from './entities/post-ratings.entity';
import { Account } from '../accounts/entities/account.entity';
import { Post } from '../posts/entities/post.entity';
import { CreatePostRatingDto } from './dto/create-post-rating.dto';
import { PostRatingMapper } from './mappers/post-rating.mapper';

@Injectable()
export class PostRatingService {
  constructor(
    @InjectRepository(PostRatings)
    private readonly postRatingsRepository: Repository<PostRatings>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  // Create a new rating
  async create(postId: string, customerId: number, dto: CreatePostRatingDto) {
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Không tìm thấy bài đăng');

    // Check if user already rated this post
    const existing = await this.postRatingsRepository.findOne({
      where: { post: { id: postId }, customer: { id: customerId } },
    });
    if (existing) throw new BadRequestException('Bạn đã đánh giá bài đăng này rồi');

    const customer = await this.accountRepository.findOne({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Không tìm thấy khách hàng');

    // Create a new rating entity
    const rating = this.postRatingsRepository.create({
      post,
      customer,
      rating: dto.rating,
      content: dto.content,
    });

    const saved = await this.postRatingsRepository.save(rating);
    saved.post = post;
    saved.customer = customer;

    return PostRatingMapper.toSafeDto(saved);
  }

  // Get a paginated list of ratings for a post
  async findAll(
    postId: string,
    opts: { page: number; limit: number; rating?: number; sort?: string },
  ) {
    const { page, limit, rating, sort } = opts;

    const qb = this.postRatingsRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.customer', 'customer')
      .leftJoinAndSelect('r.post', 'post')
      .leftJoinAndSelect('post.seller', 'seller')
      .where('r.post_id = :postId', { postId });

    // Optional rating filter
    if (rating !== undefined) qb.andWhere('r.rating = :rating', { rating });

    // Sorting options
    if (sort === 'rating_desc') qb.orderBy('r.rating', 'DESC');
    else if (sort === 'rating_asc') qb.orderBy('r.rating', 'ASC');
    else qb.orderBy('r.createdAt', 'DESC');

    const [rows, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: PostRatingMapper.toSafeDtoArray(rows),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get a single rating by ID
  async findOne(id: string, currentUserId: number) {
    const review = await this.postRatingsRepository.findOne({
      where: { id },
      relations: ['post', 'customer'],
      withDeleted: true,
    });
    if (!review) throw new NotFoundException('Không tìm thấy đánh giá');

    // Hide deleted reviews for non-owners
    if ((review as any).deletedAt && review.customer?.id !== currentUserId)
      throw new NotFoundException('Không tìm thấy đánh giá');

    return PostRatingMapper.toSafeDto(review);
  }

  // Get seller rating statistics (average rating + total reviews)
  async getSellerRatingStats(sellerId: number) {
    if (!sellerId || sellerId <= 0) {
      throw new BadRequestException('ID người bán không hợp lệ');
    }

    const stats = await this.postRatingsRepository
      .createQueryBuilder('pr')
      .select('COALESCE(AVG(pr.rating), 0)', 'averageRating')
      .addSelect('COUNT(pr.id)', 'totalReviews')
      .innerJoin('pr.post', 'p')
      .where('p.seller.id = :sellerId', { sellerId })
      .andWhere('pr.deletedAt IS NULL')
      .getRawOne();

    return {
      averageRating: stats ? Math.round(parseFloat(stats.averageRating) * 10) / 10 : 0,
      totalReviews: stats ? parseInt(stats.totalReviews) : 0,
    };
  }

  // Check if user has already rated a post
  async hasUserRatedPost(postId: string, userId: number): Promise<boolean> {
    const existing = await this.postRatingsRepository.findOne({
      where: { post: { id: postId }, customer: { id: userId } },
    });
    return !!existing;
  }

  // Get ratings given by a user (ratings they submitted)
  async getMyRatings(userId: number, opts: { page: number; limit: number }) {
    const { page, limit } = opts;

    const qb = this.postRatingsRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.customer', 'customer')
      .leftJoinAndSelect('r.post', 'post')
      .leftJoinAndSelect('post.seller', 'seller')
      .where('r.customer.id = :userId', { userId })
      .orderBy('r.createdAt', 'DESC');

    const [rows, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: PostRatingMapper.toSafeDtoArray(rows),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get ratings received by a user (as a seller)
  async getReceivedRatings(sellerId: number, opts: { page: number; limit: number }) {
    const { page, limit } = opts;

    const qb = this.postRatingsRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.customer', 'customer')
      .leftJoinAndSelect('r.post', 'post')
      .leftJoinAndSelect('post.seller', 'seller')
      .where('post.seller.id = :sellerId', { sellerId })
      .orderBy('r.createdAt', 'DESC');

    const [rows, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: PostRatingMapper.toSafeDtoArray(rows),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }
}
