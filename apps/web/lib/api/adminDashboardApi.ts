// lib/api/adminApi.ts
import { api } from '@/lib/axios';
import { getAuthHeaders } from '@/lib/auth';
import type { Account } from '@/types/account';
import type { Post } from '@/types/api/post';

/**
 * Paginated response from backend
 */
export interface PaginatedPostsResponse {
  data: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Admin Dashboard Statistics
 */
export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalPublishedPosts: number;
  totalPendingPosts: number;
  totalRejectedPosts: number;
  totalBookmarks: number;
  newUsersToday: number;
  newPostsToday: number;
  activeUsers: number;
  postsByType: {
    EV_CAR: number;
    EV_BIKE: number;
    BATTERY: number;
  };
  postsByStatus: {
    DRAFT: number;
    PENDING_REVIEW: number;
    PUBLISHED: number;
    REJECTED: number;
    PAUSED: number;
    SOLD: number;
    ARCHIVED: number;
  };
  usersByRole: {
    USER: number;
    ADMIN: number;
  };
  usersByStatus: {
    ACTIVE: number;
    BANNED: number;
  };
}

/**
 * Time series data for charts
 */
export interface TimeSeriesData {
  date: string;
  users: number;
  posts: number;
  bookmarks: number;
}

/**
 * Account count response
 */
export interface AccountCountResponse {
  count: number;
  status?: string;
}

/**
 * Post count response
 */
export interface PostCountResponse {
  count: number;
  status?: string;
}

/**
 * Get dashboard statistics
 * Requires admin authentication
 * Uses count APIs and fetches limited posts for type/today calculations
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const headers = getAuthHeaders();

    // Fetch counts in parallel using count APIs
    const [
      accountsRes,
      recentPostsRes,
      totalPostsCount,
      publishedCount,
      pendingCount,
      rejectedCount,
      activeUsersCount,
      bannedUsersCount,
    ] = await Promise.all([
      api.get<Account[]>('/accounts', { headers }),
      api.get<PaginatedPostsResponse>('/posts/admin/all?limit=100&order=DESC', { headers }),
      getPostCount(), // All posts
      getPostCount('PUBLISHED'),
      getPostCount('PENDING_REVIEW'),
      getPostCount('REJECTED'),
      getAccountCount('active'),
      getAccountCount('banned'),
    ]);

    const accounts = accountsRes.data;
    const recentPosts = recentPostsRes.data.data; // Last 100 posts for calculations

    // Calculate today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate statistics
    const stats: DashboardStats = {
      totalUsers: accounts.length,
      totalPosts: totalPostsCount.count,
      totalPublishedPosts: publishedCount.count,
      totalPendingPosts: pendingCount.count,
      totalRejectedPosts: rejectedCount.count,
      totalBookmarks: 0, // This would need a separate API endpoint
      newUsersToday: accounts.filter((a) => {
        const createdAt = new Date(a.createdAt);
        return createdAt >= today;
      }).length,
      newPostsToday: recentPosts.filter((p) => {
        const createdAt = new Date(p.createdAt);
        return createdAt >= today;
      }).length,
      activeUsers: activeUsersCount.count,
      postsByType: {
        // Note: Using recent posts sample - may not be 100% accurate for large datasets
        EV_CAR: recentPosts.filter((p) => p.postType === 'EV_CAR').length,
        EV_BIKE: recentPosts.filter((p) => p.postType === 'EV_BIKE').length,
        BATTERY: recentPosts.filter((p) => p.postType === 'BATTERY').length,
      },
      postsByStatus: {
        DRAFT: recentPosts.filter((p) => p.status === 'DRAFT').length,
        PENDING_REVIEW: pendingCount.count,
        PUBLISHED: publishedCount.count,
        REJECTED: rejectedCount.count,
        PAUSED: recentPosts.filter((p) => p.status === 'PAUSED').length,
        SOLD: recentPosts.filter((p) => p.status === 'SOLD').length,
        ARCHIVED: recentPosts.filter((p) => p.status === 'ARCHIVED').length,
      },
      usersByRole: {
        USER: accounts.filter((a) => a.role === 'user').length,
        ADMIN: accounts.filter((a) => a.role === 'admin').length,
      },
      usersByStatus: {
        ACTIVE: activeUsersCount.count,
        BANNED: bannedUsersCount.count,
      },
    };

    return stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

/**
 * Get time series data for the last N days
 * Requires admin authentication
 * Note: This fetches limited data (max 1000 records due to API limit)
 * For production, consider creating a dedicated stats API endpoint
 */
export async function getTimeSeriesData(days: number = 7): Promise<TimeSeriesData[]> {
  try {
    const headers = getAuthHeaders();

    // Fetch max allowed records (1000 is API limit)
    const [accountsRes, postsRes] = await Promise.all([
      api.get<Account[]>('/accounts', { headers }),
      api.get<PaginatedPostsResponse>('/posts/admin/all?limit=1000&order=DESC', { headers }),
    ]);

    const accounts = accountsRes.data;
    const posts = postsRes.data.data;

    // Generate date range
    const dateRange: TimeSeriesData[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dateStr = date.toISOString().split('T')[0] || '';

      const usersCount = accounts.filter((a) => {
        const createdAt = new Date(a.createdAt);
        return createdAt >= date && createdAt < nextDate;
      }).length;

      const postsCount = posts.filter((p) => {
        const createdAt = new Date(p.createdAt);
        return createdAt >= date && createdAt < nextDate;
      }).length;

      dateRange.push({
        date: dateStr,
        users: usersCount,
        posts: postsCount,
        bookmarks: 0, // Would need separate API
      });
    }

    return dateRange;
  } catch (error) {
    console.error('Error fetching time series data:', error);
    throw error;
  }
}

/**
 * Get recent users (last 10)
 * Requires admin authentication
 */
export async function getRecentUsers(limit: number = 10): Promise<Account[]> {
  try {
    const { data } = await api.get<Account[]>('/accounts', {
      headers: getAuthHeaders(),
    });

    return data
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent users:', error);
    throw error;
  }
}

/**
 * Get recent posts (last 10)
 * Requires admin authentication
 */
export async function getRecentPosts(limit: number = 10): Promise<Post[]> {
  try {
    const { data } = await api.get<PaginatedPostsResponse>(
      `/posts/admin/all?limit=${limit}&order=DESC`,
      {
        headers: getAuthHeaders(),
      },
    );

    // Backend already sorts by createdAt DESC, just return the data array
    return data.data;
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    throw error;
  }
}

/**
 * Get account count by status
 * Requires admin authentication
 * @param status - Filter by account status ('active' or 'banned'). If not provided, count all accounts.
 * @returns Object with count and status
 */
export async function getAccountCount(status?: 'active' | 'banned'): Promise<AccountCountResponse> {
  try {
    const params = new URLSearchParams();
    if (status) {
      params.append('status', status);
    }

    const { data } = await api.get<AccountCountResponse>(
      `/accounts/count${params.toString() ? `?${params.toString()}` : ''}`,
      {
        headers: getAuthHeaders(),
      },
    );

    return data;
  } catch (error) {
    console.error('Error fetching account count:', error);
    throw error;
  }
}

/**
 * Get post count by status
 * Requires admin authentication
 * @param status - Filter by post status. If not provided, count all posts.
 * @returns Object with count and status
 */
export async function getPostCount(
  status?: 'DRAFT' | 'PENDING_REVIEW' | 'REJECTED' | 'PUBLISHED' | 'PAUSED' | 'SOLD' | 'ARCHIVED',
): Promise<PostCountResponse> {
  try {
    const params = new URLSearchParams();
    if (status) {
      params.append('status', status);
    }

    const { data } = await api.get<PostCountResponse>(
      `/posts/count${params.toString() ? `?${params.toString()}` : ''}`,
      {
        headers: getAuthHeaders(),
      },
    );

    return data;
  } catch (error) {
    console.error('Error fetching post count:', error);
    throw error;
  }
}
