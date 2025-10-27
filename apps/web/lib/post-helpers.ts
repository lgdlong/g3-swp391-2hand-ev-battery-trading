/**
 * Helper functions for post data extraction and formatting
 */

/**
 * Extract title from post data
 */
export function pickTitle(p: any): string {
  return p?.title || `Post`;
}

/**
 * Extract first image URL from post data
 */
export function pickImageUrl(p: any): string | null {
  const imgs = p?.images;
  if (Array.isArray(imgs) && imgs.length > 0) {
    const first = imgs[0];
    if (first?.url) return first.url;
  }
  return null;
}

/**
 * Extract and parse price from post data
 */
export function pickPrice(p: any): number | null {
  const price = p?.priceVnd;
  if (price == null) return null;
  const numPrice = Number(price);
  return isNaN(numPrice) ? null : numPrice;
}

/**
 * Format date string to Vietnamese relative time
 * @param dateString - ISO date string
 * @returns Formatted time string (e.g., "Hôm nay", "3 ngày trước")
 */
export function formatTimeAgo(dateString: string): string {
  console.log('Formatting date:', dateString);
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return '1 ngày trước';
    if (diffDays < 30) return `${diffDays} ngày trước`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 tháng trước';
    if (diffMonths < 12) return `${diffMonths} tháng trước`;

    return `${Math.floor(diffMonths / 12)} năm trước`;
  } catch {
    return 'Gần đây';
  }
}

/**
 * Extract location from post data with priority: district > ward > province
 */
export function pickLocation(p: any): string {
  const district = p?.districtNameCached;
  const ward = p?.wardNameCached;
  const province = p?.provinceNameCached;

  // Ưu tiên hiển thị quận/huyện
  if (district && district !== 'N/A') return district;
  if (ward && ward !== 'N/A') return ward;
  if (province && province !== 'N/A') return province;

  return 'Không rõ';
}
