import { PostEvCarDetails } from '../entities/post-ev-car-details.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CarDetailsService {
  constructor(
    @InjectRepository(PostEvCarDetails)
    private readonly repo: Repository<PostEvCarDetails>,
  ) {}
}
