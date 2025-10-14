import { api } from '../axios';
import { getAuthHeaders } from '../auth';
import { PostReviewLog } from '@/types/post-review-log';

export async function getMyPostReviewLog(postId: number): Promise<PostReviewLog[]> {
  const { data } = await api.get<PostReviewLog[]>(`/post-review/post/${postId}/me`, {
    headers: getAuthHeaders(),
  });
  return data;
}
