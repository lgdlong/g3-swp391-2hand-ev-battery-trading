import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostRatings } from './entities/post-ratings.entity';
import { Account } from '../accounts/entities/account.entity';
import { Post } from '../posts/entities/post.entity';
import { CreatePostRatingDto } from './dto/create-post-rating.dto';
import { UpdatePostRatingDto } from './dto/update-post-rating.dto';
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
    if (!post) throw new NotFoundException('Post not found');

    // Check if user already rated this post
    const existing = await this.postRatingsRepository.findOne({
      where: { post: { id: postId }, customer: { id: customerId } },
    });
    if (existing) throw new BadRequestException('You have already rated this post');

    const customer = await this.accountRepository.findOne({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

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
      .leftJoin('r.post', 'post')
      .addSelect(['post.id'])
      .where('r.post_id = :postId', { postId });

    // Optional rating filter
    if (rating !== undefined) qb.andWhere('r.rating = :rating', { rating });

    // Sorting options
    if (sort === 'rating_desc') qb.orderBy('r.rating', 'DESC');
    else if (sort === 'rating_asc') qb.orderBy('r.rating', 'ASC');
    else qb.orderBy('r.createdAt', 'DESC');

    const [rows, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();

    return {
      items: PostRatingMapper.toSafeDtoArray(rows),
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
    if (!review) throw new NotFoundException('Rating not found');

    // Hide deleted reviews for non-owners
    if ((review as any).deletedAt && review.customer?.id !== currentUserId)
      throw new NotFoundException('Rating not found');

    return PostRatingMapper.toSafeDto(review);
  }

  // // Update rating content or score
  // async update(id: string, dto: UpdatePostRatingDto, userId: number) {
  //   const rating = await this.postRatingsRepository.findOne({
  //     where: { id },
  //     relations: ['customer'],
  //   });

  //   if (!rating) throw new NotFoundException('Rating not found');
  //   if (rating.customer.id !== userId)
  //     throw new ForbiddenException('You cannot edit others’ rating');

  //   if (dto.rating !== undefined) rating.rating = dto.rating;
  //   if (dto.content !== undefined) rating.content = dto.content;

  //   const saved = await this.postRatingsRepository.save(rating);
  //   return PostRatingMapper.toSafeDto(saved);
  // }

  // Delete a rating by id
  async removeById(id: string, userId: number) {
    const rating = await this.postRatingsRepository.findOne({
      where: { id },
      relations: ['customer'],
    });
    if (!rating) throw new NotFoundException('Rating not found');
    if (rating.customer.id !== userId)
      throw new ForbiddenException('You cannot delete others rating');

    await this.postRatingsRepository.softDelete(rating.id);
    return { message: 'Deleted successfully by id #' + id };
  }


  // Delete a rating by post id
  async removeByPostId(postId: string, userId: number) {
    const rating = await this.postRatingsRepository.findOne({
      where: { post: { id: postId }, customer: { id: userId } },
      relations: ['customer'],
    });
    if (!rating) throw new NotFoundException('Rating not found');
    if (rating.customer.id !== userId)
      throw new ForbiddenException('You cannot delete others rating');

    
    const deletedAt = new Date();
    await this.postRatingsRepository.softDelete(rating.id);

    return { message: 'Deleted successfully for post id #' + postId };
  }
}
