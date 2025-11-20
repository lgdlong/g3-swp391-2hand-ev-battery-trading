import { Repository, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { PostEvBikeDetails } from '../entities/post-ev-bike-details.entity';

@Injectable()
export class BikeDetailsService {
  constructor(
    @InjectRepository(PostEvBikeDetails)
    private readonly repo: Repository<PostEvBikeDetails>,
  ) {}

  // dùng trong 1 transaction do PostsService truyền vào
  // tạo bản ghi trong một transaction được mở bên ngoài (trx)
  async createWithTrx(trx: EntityManager, payload: Partial<PostEvBikeDetails>) {
    const entity = trx.create(PostEvBikeDetails, payload);
    return trx.save(entity);
  }

  async updateWithTrx(trx: EntityManager, postId: string, patch: Partial<PostEvBikeDetails>) {
    await trx.update(PostEvBikeDetails, { post_id: postId }, patch);
    return trx.findOneBy(PostEvBikeDetails, { post_id: postId });
  }
}
