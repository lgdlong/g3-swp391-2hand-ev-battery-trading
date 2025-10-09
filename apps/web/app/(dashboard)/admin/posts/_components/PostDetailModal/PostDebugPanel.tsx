import { Post } from '@/types/api/post';

interface PostDebugPanelProps {
  post: Post;
}

export function PostDebugPanel({ post }: PostDebugPanelProps) {
  return (
    <div className="bg-yellow-50 border-b border-yellow-200 p-4">
      <details className="text-xs">
        <summary className="cursor-pointer font-semibold text-yellow-800">
          🐛 Debug Data (Click to expand)
        </summary>
        <pre className="mt-2 p-2 bg-white rounded border text-xs overflow-auto max-h-40">
          {JSON.stringify(
            {
              id: post.id,
              title: post.title,
              description: post.description,
              descriptionLength: post.description?.length,
              descriptionHasNewlines: post.description?.includes('\n'),
              images: post.images,
              imagesLength: post.images?.length,
              imagesType: typeof post.images,
              imagesIsArray: Array.isArray(post.images),
              firstImage: post.images?.[0],
              provinceNameCached: post.provinceNameCached,
              districtNameCached: post.districtNameCached,
              wardNameCached: post.wardNameCached,
              seller: {
                id: post.seller?.id,
                email: post.seller?.email,
                phone: post.seller?.phone,
                fullName: post.seller?.fullName,
                status: post.seller?.status,
                role: post.seller?.role,
              },
              carDetails: post.carDetails,
              bikeDetails: post.bikeDetails,
            },
            null,
            2,
          )}
        </pre>
      </details>
    </div>
  );
}
