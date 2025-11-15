'use client';

import { useQuery } from '@tanstack/react-query';
import { StatsCards, DashboardCharts, RecentTables, FinancialStatsCards } from './_components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Shield, AlertCircle } from 'lucide-react';
import {
  getDashboardStats,
  getTimeSeriesData,
  getRecentUsers,
  getRecentPosts,
} from '@/lib/api/adminDashboardApi';
import { getAdminDashboardStatistics } from '@/lib/api/adminStatisticsApi';

export default function AdminDashboard() {
  // Fetch dashboard data with React Query
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  const {
    data: timeSeriesData,
    isLoading: timeSeriesLoading,
    error: timeSeriesError,
  } = useQuery({
    queryKey: ['admin-dashboard-timeseries'],
    queryFn: () => getTimeSeriesData(7), // Last 7 days
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  });

  const {
    data: recentUsers,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ['admin-recent-users'],
    queryFn: () => getRecentUsers(10),
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const {
    data: recentPosts,
    isLoading: postsLoading,
    error: postsError,
  } = useQuery({
    queryKey: ['admin-recent-posts'],
    queryFn: () => getRecentPosts(10),
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const {
    data: adminStats,
    isLoading: adminStatsLoading,
    error: adminStatsError,
  } = useQuery({
    queryKey: ['admin-dashboard-statistics'],
    queryFn: getAdminDashboardStatistics,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const isLoading =
    statsLoading || timeSeriesLoading || usersLoading || postsLoading || adminStatsLoading;
  const hasError = statsError || timeSeriesError || usersError || postsError || adminStatsError;

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bảng Điều Khiển Quản Trị</h1>
          <p className="text-muted-foreground mt-1">
            Tổng quan hệ thống quản lý EV Battery Trading
          </p>
        </div>
      </div>

      {/* Error Message */}
      {hasError && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-500">Không thể tải dữ liệu</p>
              <p className="text-xs text-red-500/80">
                {(statsError as Error)?.message ||
                  (timeSeriesError as Error)?.message ||
                  (usersError as Error)?.message ||
                  (postsError as Error)?.message ||
                  'Vui lòng thử lại sau'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      {stats && <StatsCards stats={stats} isLoading={statsLoading} />}

      {/* Financial Statistics Cards */}
      {adminStats?.financial && (
        <FinancialStatsCards financial={adminStats.financial} isLoading={adminStatsLoading} />
      )}

      {/* Charts Section */}
      {stats && timeSeriesData && (
        <DashboardCharts
          stats={stats}
          timeSeriesData={timeSeriesData}
          isLoading={timeSeriesLoading}
        />
      )}

      {/* System Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Database className="h-5 w-5 text-primary" />
              Trạng Thái Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Kết Nối</span>
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                Đã Kết Nối
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Thời Gian Phản Hồi</span>
              <span className="text-sm font-medium text-foreground">
                {isLoading ? '...' : '< 100ms'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tổng Số Records</span>
              <span className="text-sm font-medium text-foreground">
                {stats
                  ? (stats.totalUsers + stats.totalPosts).toLocaleString()
                  : isLoading
                    ? '...'
                    : '0'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5 text-primary" />
              Tình Trạng Hệ Thống
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Uptime</span>
              <span className="text-sm font-medium text-green-400">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">API Status</span>
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                Hoạt Động
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cần Xem Xét</span>
              <Badge
                variant={stats && stats.totalPendingPosts > 0 ? 'default' : 'outline'}
                className="text-xs"
              >
                {stats ? stats.totalPendingPosts : isLoading ? '...' : '0'} bài đăng
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tables */}
      {recentUsers && recentPosts && (
        <RecentTables
          recentUsers={recentUsers}
          recentPosts={recentPosts}
          isLoading={usersLoading || postsLoading}
        />
      )}
    </main>
  );
}
