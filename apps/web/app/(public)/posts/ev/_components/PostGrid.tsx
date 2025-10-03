import { PostCard } from './PostCard';
import type { Post } from './types';

interface PostGridProps {
  posts: Post[];
  onTitleClick?: (title: string) => void;
}

export function PostGrid({ posts, onTitleClick }: PostGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {posts.map((item) => (
        <PostCard key={item.id} item={item} onTitleClick={onTitleClick} />
      ))}
    </div>
  );
}
