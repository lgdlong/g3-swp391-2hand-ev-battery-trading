export interface Actor {
  id: string;
  displayName?: string | null;
}

export interface PostReviewLog {
  id: string;
  postId: string;
  action: string;
  oldStatus?: string | null;
  newStatus?: string | null;
  reason?: string | null;
  actorId?: string | null;
  actor?: Actor | null;
  createdAt: string;
}
