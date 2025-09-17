import { Injectable } from '@nestjs/common';
import { CreatePostReviewDto } from './dto/create-post-review.dto';
import { UpdatePostReviewDto } from './dto/update-post-review.dto';

@Injectable()
export class PostReviewService {
  create(createPostReviewDto: CreatePostReviewDto) {
    return 'This action adds a new postReview';
  }

  findAll() {
    return `This action returns all postReview`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postReview`;
  }

  update(id: number, updatePostReviewDto: UpdatePostReviewDto) {
    return `This action updates a #${id} postReview`;
  }

  remove(id: number) {
    return `This action removes a #${id} postReview`;
  }
}
