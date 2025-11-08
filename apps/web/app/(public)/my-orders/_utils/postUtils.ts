/**
 * Utility functions for post-related operations in my-orders page
 */

export function getPostDetailRoute(postType: string, postId: string): string {
  if (postType === 'BATTERY') {
    return `/posts/batteries/${postId}`;
  }
  return `/posts/ev/${postId}`;
}

export function getPostTypeLabel(postType: string): string {
  switch (postType) {
    case 'EV_CAR':
      return 'Xe ô tô điện';
    case 'EV_BIKE':
      return 'Xe máy điện';
    case 'BATTERY':
      return 'Pin điện';
    default:
      return 'Sản phẩm';
  }
}

