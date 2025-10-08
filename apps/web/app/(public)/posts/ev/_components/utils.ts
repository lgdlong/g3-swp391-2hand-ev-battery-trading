// Format VND currency
export const formatVnd = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(numAmount);
};

// Helper function to safely display flexible field values
export const displayValue = (value: string | number | object | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object') return JSON.stringify(value);
  return 'N/A';
};

// Helper function to safely convert to string for toLowerCase operations
export const toStringValue = (value: string | number | object | null | undefined): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return JSON.stringify(value);
};

// Status helper functions
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'PUBLISHED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'PENDING_REVIEW':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'PAUSED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'SOLD':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'ARCHIVED':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'PUBLISHED':
      return 'Đã duyệt';
    case 'PENDING_REVIEW':
      return 'Chờ duyệt';
    case 'DRAFT':
      return 'Nháp';
    case 'REJECTED':
      return 'Từ chối';
    case 'PAUSED':
      return 'Tạm dừng';
    case 'SOLD':
      return 'Đã bán';
    case 'ARCHIVED':
      return 'Lưu trữ';
    default:
      return status;
  }
};
