'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  FileText,
  Activity,
  TrendingUp,
  UserX,
  CheckCircle,
  Clock,
  XCircle,
  FileEdit,
  Pause,
  ShoppingBag,
  Archive,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { DashboardStats } from '@/lib/api/adminDashboardApi';
import { getAccountCount, getPostCount } from '@/lib/api/adminDashboardApi';

interface StatsCardsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const { data: bannedCount } = useQuery({
    queryKey: ['account-count-banned'],
    queryFn: () => getAccountCount('banned'),
    refetchInterval: 30000,
  });

  // Fetch post counts
  const { data: draftPostsCount } = useQuery({
    queryKey: ['post-count-draft'],
    queryFn: () => getPostCount('DRAFT'),
    refetchInterval: 30000,
  });

  const { data: pendingPostsCount } = useQuery({
    queryKey: ['post-count-pending'],
    queryFn: () => getPostCount('PENDING_REVIEW'),
    refetchInterval: 30000,
  });

  const { data: rejectedPostsCount } = useQuery({
    queryKey: ['post-count-rejected'],
    queryFn: () => getPostCount('REJECTED'),
    refetchInterval: 30000,
  });

  const { data: publishedPostsCount } = useQuery({
    queryKey: ['post-count-published'],
    queryFn: () => getPostCount('PUBLISHED'),
    refetchInterval: 30000,
  });

  const { data: pausedPostsCount } = useQuery({
    queryKey: ['post-count-paused'],
    queryFn: () => getPostCount('PAUSED'),
    refetchInterval: 30000,
  });

  const { data: soldPostsCount } = useQuery({
    queryKey: ['post-count-sold'],
    queryFn: () => getPostCount('SOLD'),
    refetchInterval: 30000,
  });

  const { data: archivedPostsCount } = useQuery({
    queryKey: ['post-count-archived'],
    queryFn: () => getPostCount('ARCHIVED'),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* User Information Section Loading */}
        <div>
          <div className="h-7 bg-muted rounded w-48 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-card border-border animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Post Information Section Loading */}
        <div>
          <div className="h-7 bg-muted rounded w-48 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="bg-card border-border animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  type CardType = {
    title: string;
    value: number;
    icon: typeof Users;
    badge: string;
    badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive';
    color: string;
  };

  // User-related cards
  const userCards: CardType[] = [
    {
      title: 'Tổng Users',
      value: stats.totalUsers,
      icon: Users,
      badge: `+${stats.newUsersToday} hôm nay`,
      badgeVariant: 'secondary',
      color: 'text-blue-500',
    },
    {
      title: 'Users Hoạt Động',
      value: stats.activeUsers,
      icon: Activity,
      badge: `${((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% tổng`,
      badgeVariant: 'outline',
      color: 'text-purple-500',
    },
    {
      title: 'Accounts Banned',
      value: bannedCount?.count || 0,
      icon: UserX,
      badge: bannedCount?.count ? 'Bị cấm' : 'Không có',
      badgeVariant: bannedCount?.count ? 'destructive' : 'outline',
      color: 'text-red-500',
    },
  ];

  // Post-related cards
  const postCards: CardType[] = [
    {
      title: 'Tổng Posts',
      value: stats.totalPosts,
      icon: FileText,
      badge: `+${stats.newPostsToday} hôm nay`,
      badgeVariant: 'secondary',
      color: 'text-green-500',
    },
    {
      title: 'Posts Xe Ô Tô',
      value: stats.postsByType.EV_CAR,
      icon: TrendingUp,
      badge: `${((stats.postsByType.EV_CAR / stats.totalPosts) * 100).toFixed(1)}%`,
      badgeVariant: 'outline',
      color: 'text-cyan-500',
    },
    {
      title: 'Posts Xe Máy',
      value: stats.postsByType.EV_BIKE,
      icon: TrendingUp,
      badge: `${((stats.postsByType.EV_BIKE / stats.totalPosts) * 100).toFixed(1)}%`,
      badgeVariant: 'outline',
      color: 'text-indigo-500',
    },
    {
      title: 'Posts Draft',
      value: draftPostsCount?.count || 0,
      icon: FileEdit,
      badge: draftPostsCount?.count ? 'Bản nháp' : 'Không có',
      badgeVariant: 'secondary',
      color: 'text-gray-500',
    },
    {
      title: 'Posts Chờ Duyệt',
      value: pendingPostsCount?.count || 0,
      icon: Clock,
      badge: pendingPostsCount?.count ? 'Đang chờ' : 'Không có',
      badgeVariant: 'secondary',
      color: 'text-yellow-500',
    },
    {
      title: 'Posts Bị Từ Chối',
      value: rejectedPostsCount?.count || 0,
      icon: XCircle,
      badge: rejectedPostsCount?.count ? 'Bị từ chối' : 'Không có',
      badgeVariant: rejectedPostsCount?.count ? 'destructive' : 'outline',
      color: 'text-red-500',
    },
    {
      title: 'Posts Đã Duyệt',
      value: publishedPostsCount?.count || 0,
      icon: CheckCircle,
      badge: 'Đã xuất bản',
      badgeVariant: 'outline',
      color: 'text-green-500',
    },
    {
      title: 'Posts Paused',
      value: pausedPostsCount?.count || 0,
      icon: Pause,
      badge: pausedPostsCount?.count ? 'Tạm dừng' : 'Không có',
      badgeVariant: 'outline',
      color: 'text-orange-500',
    },
    {
      title: 'Posts Sold',
      value: soldPostsCount?.count || 0,
      icon: ShoppingBag,
      badge: soldPostsCount?.count ? 'Đã bán' : 'Không có',
      badgeVariant: 'outline',
      color: 'text-blue-500',
    },
    {
      title: 'Posts Archived',
      value: archivedPostsCount?.count || 0,
      icon: Archive,
      badge: archivedPostsCount?.count ? 'Đã lưu trữ' : 'Không có',
      badgeVariant: 'outline',
      color: 'text-slate-500',
    },
  ];

  // Split posts into two rows: overview (3) and statuses (rest)
  const postOverviewCards = postCards.slice(0, 3);
  const postStatusCards = postCards.slice(3);

  const renderCards = (cards: CardType[]) => (
    <>
      {cards.map((card, index) => (
        <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{card.value.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={card.badgeVariant} className="text-xs">
                {card.badge}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );

  return (
    <div className="space-y-8">
      {/* User Information Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Thông Tin Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderCards(userCards)}
        </div>
      </div>

      {/* Post Information Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Thông Tin Posts</h2>
        {/* Row 1: 3 overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderCards(postOverviewCards)}
        </div>
        {/* Row 2: remaining status cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {renderCards(postStatusCards)}
        </div>
      </div>
    </div>
  );
}
