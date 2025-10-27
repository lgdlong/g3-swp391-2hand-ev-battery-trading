import Image from 'next/image';
import { Car } from 'lucide-react';
import { Post } from '@/types/api/post';
import { DEFAULT_IMAGE } from '@/constants/images';

interface PostImagesGalleryProps {
  post: Post;
}

export function PostImagesGallery({ post }: PostImagesGalleryProps) {
  // Debug images data
  console.log('Images debug:', {
    images: post.images,
    isArray: Array.isArray(post.images),
    length: post.images?.length,
    firstImage: post.images?.[0],
  });

  const hasImages =
    post.images &&
    Array.isArray(post.images) &&
    post.images.length > 0 &&
    post.images.some((img) => img !== null && img !== undefined);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Car className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Hình ảnh sản phẩm</h3>
      </div>

      {hasImages ? (
        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {post.images.map((image, index: number) => {
            if (!image) return null;

            const imageUrl = typeof image === 'string' ? image : DEFAULT_IMAGE;

            if (!imageUrl) return null;

            return (
              <div key={index} className="group relative overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src={imageUrl}
                  alt={`${post.title} ${index + 1}`}
                  width={200}
                  height={150}
                  className="w-full h-32 object-cover group-hover:scale-110 transition-all duration-500 ease-out"
                  onError={(e) => {
                    console.error('Image load error:', imageUrl);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {index + 1}/{post.images.length}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Chưa có hình ảnh</p>
            <p className="text-xs text-gray-400 mt-1">
              {post.images
                ? `Dữ liệu: ${JSON.stringify(post.images)}`
                : 'Không có dữ liệu hình ảnh'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
