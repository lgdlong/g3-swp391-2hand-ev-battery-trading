import type { Post } from '@/types/api/post';
import { BatteryPostCard } from './BatteryPostCard';

interface PostGridProps {
  posts: Post[];
  onTitleClick?: (title: string) => void;
}

export function PostGrid({ posts, onTitleClick }: PostGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <BatteryPostCard key={post.id} item={post} onTitleClick={onTitleClick} />
      ))}
    </div>
  );
}
