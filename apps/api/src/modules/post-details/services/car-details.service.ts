import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { PostEvCarDetails } from '../entities/post-ev-car-details.entity';

@Injectable()
export class CarDetailsService {
  constructor(
    @InjectRepository(PostEvCarDetails)
    private readonly repo: Repository<PostEvCarDetails>,
  ) {}

  // dùng trong 1 transaction do PostsService truyền vào
  // tạo bản ghi trong một transaction được mở bên ngoài (trx)
  async createWithTrx(trx: EntityManager, payload: Partial<PostEvCarDetails>) {
    const entity = trx.create(PostEvCarDetails, payload);
    return trx.save(entity);
  }

  async updateWithTrx(trx: EntityManager, postId: string, patch: Partial<PostEvCarDetails>) {
    await trx.update(PostEvCarDetails, { post_id: postId }, patch);
    return trx.findOneBy(PostEvCarDetails, { post_id: postId });
  }
}
