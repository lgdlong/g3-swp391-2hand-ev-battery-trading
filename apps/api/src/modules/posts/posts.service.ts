import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { PostStatus } from '../../shared/enums/post-status.enum';
import { AuthUser } from '../../core/guards/roles.guard';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, user: AuthUser): Promise<Post> {
    // Create new post entity with user as seller
    const post = this.postRepository.create({
      ...createPostDto,
      seller: { id: user.sub } as any, // TypeORM will handle the relation
      status: PostStatus.DRAFT, // Default status for new posts
      priceVnd: createPostDto.priceVnd.toString(), // Convert number to string for database
    });

    // Save and return the created post
    return await this.postRepository.save(post);
  }

  // findAll() {
  //   return `This action returns all posts`;
  // }
  //
  // findOne(id: number) {
  //   return `This action returns a #${id} post`;
  // }
  //
  // update(id: number, updatePostDto: UpdatePostDto) {
  //   return `This action updates a #${id} post`;
  // }
  //
  // remove(id: number) {
  //   return `This action removes a #${id} post`;
  // }
}
