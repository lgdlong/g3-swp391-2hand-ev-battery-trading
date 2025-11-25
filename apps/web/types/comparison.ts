import type { Post } from './post';

export interface ComparisonItem {
  id: string;
  type: 'CAR' | 'BIKE' | 'BATTERY';
  post: Post;
}

export interface ComparisonState {
  items: ComparisonItem[];
  selectedIds: Set<string>;
}
