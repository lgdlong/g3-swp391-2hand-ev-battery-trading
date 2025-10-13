/**
 * Utility functions for formatting data in the application
 */

import type { PostUI } from '@/types/post';

/**
 * Formats a VND amount to localized currency string
 * @param amount Amount as string or number
 * @returns Formatted VND currency string
 */
export function formatVnd(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(numAmount);
}

/**
 * Formats a date string to relative time
 * @param dateString ISO date string
 * @returns Relative time string (e.g., "Hôm nay", "2 ngày trước")
 */
export function relativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
  return `${Math.floor(diffDays / 365)} năm trước`;
}

/**
 * Formats distance from date to now
 * @param date Date object
 * @returns Formatted distance string
 */
export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
  return `${Math.floor(diffDays / 365)} năm trước`;
}

/**
 * Returns the Vietnamese text for post origin
 * @param origin Origin code
 * @returns Vietnamese text
 */
export function originText(origin: string): string {
  const originTexts = {
    NOI_DIA: 'Nội địa',
    NHAP_KHAU: 'Nhập khẩu',
  } as const;

  return originTexts[origin as keyof typeof originTexts] || origin;
}

/**
 * Formats post location from cached address fields
 * @param post Post with location data
 * @returns Formatted location string
 */
export function getLocation(post: PostUI): string {
  const locationParts = [
    post.wardNameCached,
    post.districtNameCached,
    post.provinceNameCached,
  ].filter(Boolean);

  if (locationParts.length > 0) {
    return locationParts.join(', ');
  }

  return post.addressTextCached || 'Không rõ';
}

/**
 * Status chip configuration for post status
 */
export const statusChip = {
  /**
   * Gets CSS classes for post status
   * @param status Post status
   * @returns CSS class string for status styling
   */
  getColor(status: string): string {
    const statusColors = {
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
    } as const;

    return statusColors[status as keyof typeof statusColors] || statusColors.DRAFT;
  },

  /**
   * Gets Vietnamese text for post status
   * @param status Post status
   * @returns Vietnamese status text
   */
  getText(status: string): string {
    const statusTexts = {
      APPROVED: 'Đã duyệt',
      PENDING: 'Chờ duyệt',
      DRAFT: 'Nháp',
      REJECTED: 'Từ chối',
    } as const;

    return statusTexts[status as keyof typeof statusTexts] || status;
  },
} as const;
