'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DashboardStats, TimeSeriesData } from '@/lib/api/adminDashboardApi';

interface DashboardChartsProps {
  stats: DashboardStats;
  timeSeriesData: TimeSeriesData[];
  isLoading?: boolean;
}

const COLORS = {
  blue: '#3b82f6',
  green: '#10b981',
  orange: '#f59e0b',
  red: '#ef4444',
  purple: '#a855f7',
  cyan: '#06b6d4',
  pink: '#ec4899',
  yellow: '#eab308',
};

export function DashboardCharts({ stats, timeSeriesData, isLoading }: DashboardChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card border-border animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-40"></div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Prepare data for post types pie chart
  const postTypeData = [
    { name: 'Xe Ô Tô', value: stats.postsByType.EV_CAR, color: COLORS.blue },
    { name: 'Xe Máy', value: stats.postsByType.EV_BIKE, color: COLORS.green },
    { name: 'Pin', value: stats.postsByType.BATTERY, color: COLORS.purple },
  ];

  // Prepare data for post status chart
  const postStatusData = [
    { name: 'Đã Duyệt', value: stats.postsByStatus.PUBLISHED, color: COLORS.green },
    { name: 'Chờ Duyệt', value: stats.postsByStatus.PENDING_REVIEW, color: COLORS.orange },
    { name: 'Bị Từ Chối', value: stats.postsByStatus.REJECTED, color: COLORS.red },
    { name: 'Nháp', value: stats.postsByStatus.DRAFT, color: COLORS.cyan },
    { name: 'Tạm Dừng', value: stats.postsByStatus.PAUSED, color: COLORS.yellow },
    { name: 'Đã Bán', value: stats.postsByStatus.SOLD, color: COLORS.pink },
  ].filter((item) => item.value > 0);

  // Prepare data for user statistics
  const userStatsData = [
    { name: 'Người Dùng', value: stats.usersByRole.USER },
    { name: 'Admin', value: stats.usersByRole.ADMIN },
  ];

  const userStatusData = [
    { name: 'Hoạt Động', value: stats.usersByStatus.ACTIVE, color: COLORS.green },
    { name: 'Bị Cấm', value: stats.usersByStatus.BANNED, color: COLORS.red },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Time Series Chart - Users & Posts */}
      <Card className="bg-card border-border lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-foreground">Xu Hướng 7 Ngày Qua</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                }}
                labelStyle={{ color: '#f9fafb' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke={COLORS.blue}
                name="Users Mới"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="posts"
                stroke={COLORS.green}
                name="Posts Mới"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Post Types Distribution */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Phân Bố Loại Bài Đăng</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={postTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  const { name, percent } = props;
                  return `${name}: ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {postTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffff',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Post Status Distribution */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Trạng Thái Bài Đăng</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={postStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffff',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                }}
              />
              <Bar dataKey="value" name="Số Lượng">
                {postStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Roles Distribution */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Vai Trò Người Dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userStatsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  const { name, value } = props;
                  return `${name}: ${value}`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill={COLORS.blue} />
                <Cell fill={COLORS.purple} />
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffff',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Status Distribution */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Trạng Thái Người Dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  const { name, value } = props;
                  return `${name}: ${value}`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {userStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffff',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
