import { PostImage } from '../entities/post-image.entity';
import { PostImageResponseDto } from '../dto/post-image-response.dto';

export class PostImageMapper {
  static toResponseDto(this: void, img: PostImage): PostImageResponseDto {
    return {
      id: img.id,
      publicId: img.public_id,
      url: img.url,
      width: img.width,
      height: img.height,
      bytes: img.bytes,
      format: img.format,
      position: img.position,
      createdAt: img.created_at,
    };
  }

  static toResponseDtoArray(images: PostImage[]): PostImageResponseDto[] {
    return images.map(PostImageMapper.toResponseDto);
  }
}
