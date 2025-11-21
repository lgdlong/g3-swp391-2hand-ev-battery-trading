import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostLifecycle } from '../entities/post-lifecycle.entity';
import { CreatePostLifecycleDto } from '../dto/post-lifecycle/create-post-lifecycle.dto';
import { UpdatePostLifecycleDto } from '../dto/post-lifecycle/update-post-lifecycle.dto';
import { PostLifecycleMapper } from '../mappers/post-lifecycle.mapper';

@Injectable()
export class PostLifecycleService {
  constructor(
    @InjectRepository(PostLifecycle)
    private readonly postLifecycleRepository: Repository<PostLifecycle>,
  ) {}

  async create(createPostLifecycleDto: CreatePostLifecycleDto) {
    const postLifecycle = this.postLifecycleRepository.create(createPostLifecycleDto);
    const saved = await this.postLifecycleRepository.save(postLifecycle);
    return PostLifecycleMapper.toResponseDto(saved);
  }

  async findAll() {
    const lifecycles = await this.postLifecycleRepository.find({
      order: { updatedAt: 'DESC' },
    });
    return PostLifecycleMapper.toResponseDtoArray(lifecycles);
  }

  async findOne(id: number) {
    const lifecycle = await this.postLifecycleRepository.findOne({ where: { id } });
    if (!lifecycle) {
      throw new NotFoundException(`Không tìm thấy vòng đời bài đăng với ID ${id}`);
    }
    return PostLifecycleMapper.toResponseDto(lifecycle);
  }

  async update(id: number, updatePostLifecycleDto: UpdatePostLifecycleDto) {
    const lifecycle = await this.postLifecycleRepository.findOne({ where: { id } });
    if (!lifecycle) {
      throw new NotFoundException(`Không tìm thấy vòng đời bài đăng với ID ${id}`);
    }

    Object.assign(lifecycle, updatePostLifecycleDto);
    const saved = await this.postLifecycleRepository.save(lifecycle);
    return PostLifecycleMapper.toResponseDto(saved);
  }

  async remove(id: number) {
    const lifecycle = await this.postLifecycleRepository.findOne({ where: { id } });
    if (!lifecycle) {
      throw new NotFoundException(`Không tìm thấy vòng đời bài đăng với ID ${id}`);
    }

    await this.postLifecycleRepository.remove(lifecycle);
    return { message: 'Post lifecycle deleted successfully' };
  }
}
