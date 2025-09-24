import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { PostEvBikeDetails } from '../entities/post-ev-bike-details.entity';

@Injectable()
export class BikeDetailsService {
  constructor(
    @InjectRepository(PostEvBikeDetails)
    private readonly repo: Repository<PostEvBikeDetails>,
  ) {}
}
