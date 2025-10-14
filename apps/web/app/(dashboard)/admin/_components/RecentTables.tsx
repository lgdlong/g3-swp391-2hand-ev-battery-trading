'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from '@/lib/utils/format';
import type { Account } from '@/types/account';
import type { Post } from '@/types/api/post';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface RecentTablesProps {
  recentUsers: Account[];
  recentPosts: Post[];
  isLoading?: boolean;
}

const POST_STATUS_LABELS: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  DRAFT: { label: 'Nháp', variant: 'secondary' },
  PENDING_REVIEW: { label: 'Chờ Duyệt', variant: 'default' },
  PUBLISHED: { label: 'Đã Duyệt', variant: 'outline' },
  REJECTED: { label: 'Bị Từ Chối', variant: 'destructive' },
  PAUSED: { label: 'Tạm Dừng', variant: 'secondary' },
  SOLD: { label: 'Đã Bán', variant: 'outline' },
  ARCHIVED: { label: 'Lưu Trữ', variant: 'secondary' },
};

const POST_TYPE_LABELS: Record<string, string> = {
  EV_CAR: 'Xe Ô Tô',
  EV_BIKE: 'Xe Máy',
  BATTERY: 'Pin',
};

const ROLE_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> =
  {
    user: { label: 'Người Dùng', variant: 'secondary' },
    admin: { label: 'Admin', variant: 'default' },
  };

const STATUS_LABELS: Record<
  string,
  { label: string; variant: 'default' | 'outline' | 'destructive' }
> = {
  active: { label: 'Hoạt Động', variant: 'outline' },
  banned: { label: 'Bị Cấm', variant: 'destructive' },
};

export function RecentTables({ recentUsers, recentPosts, isLoading }: RecentTablesProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-40"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-40"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Users */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Người Dùng Mới Nhất</CardTitle>
          <Link
            href="/admin/accounts"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Xem Tất Cả
            <ExternalLink className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Chưa có người dùng nào
              </p>
            ) : (
              recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
                    <AvatarFallback>{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email || user.phone}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={ROLE_LABELS[user.role]?.variant || 'secondary'}
                      className="text-xs"
                    >
                      {ROLE_LABELS[user.role]?.label || user.role}
                    </Badge>
                    <Badge
                      variant={STATUS_LABELS[user.status]?.variant || 'outline'}
                      className="text-xs"
                    >
                      {STATUS_LABELS[user.status]?.label || user.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Posts */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Bài Đăng Mới Nhất</CardTitle>
          <Link
            href="/admin/posts"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Xem Tất Cả
            <ExternalLink className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Chưa có bài đăng nào</p>
            ) : (
              recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {post.seller?.fullName || 'Unknown'} •{' '}
                      {formatDistanceToNow(new Date(post.createdAt))}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {POST_TYPE_LABELS[post.postType] || post.postType}
                      </Badge>
                      <Badge
                        variant={POST_STATUS_LABELS[post.status]?.variant || 'secondary'}
                        className="text-xs"
                      >
                        {POST_STATUS_LABELS[post.status]?.label || post.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-primary">
                    {Number(post.priceVnd).toLocaleString('vi-VN')} đ
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
