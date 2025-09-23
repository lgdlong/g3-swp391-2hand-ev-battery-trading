export type EvPost = {
  // posts base
  id: string;
  sellerId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  statusPost: 'pending' | 'approved' | 'rejected';
  priceVnd: number;
  wardId?: string;
  addressText?: string;
  createdAt?: string;
  updatedAt?: string;

  // list rendering
  type: 'ev';
  location: string;
  thumbnail?: string;

  // ev details
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  trimId?: string;
  trimName?: string;
  manufactureYear: number;
  bodyStyle?: string;
  origin?: 'noi_dia' | 'nhap_khau';
  colorName?: string;
  seats?: number;
  condition: 'new' | 'used';
  licensePlate?: string;
  odoKm: number;
  batteryCapacityKWh: number;
  status: 'available' | 'sold' | 'reserved';
};

export const sampleEvPosts: EvPost[] = [
  {
    id: 'ev-001',
    sellerId: 'seller-100',
    title: 'VinFast VF e34 - Bản Tiêu Chuẩn - Màu Xanh',
    description: 'Xe gia đình sử dụng kỹ, bảo dưỡng định kỳ tại hãng, pin còn tốt.',
    imageUrl: '/turborepo-dark.svg',
    statusPost: 'approved',
    priceVnd: 385000000,
    wardId: 'ward-01',
    addressText: 'Quận 1, TP. Hồ Chí Minh',
    createdAt: '2024-08-01',
    updatedAt: '2025-01-10',

    type: 'ev',
    location: 'TP. Hồ Chí Minh',
    thumbnail: '/turborepo-dark.svg',

    brandId: 'vinfast',
    brandName: 'VinFast',
    modelId: 'vf-e34',
    modelName: 'VF e34',
    trimId: 'std',
    trimName: 'Standard',
    manufactureYear: 2022,
    bodyStyle: 'Crossover',
    origin: 'noi_dia',
    colorName: 'Xanh',
    seats: 5,
    condition: 'used',
    licensePlate: '51H-123.45',
    odoKm: 23000,
    batteryCapacityKWh: 42,
    status: 'available',
  },
  {
    id: 'ev-002',
    sellerId: 'seller-200',
    title: 'VinFast VF 5 Plus - 2023 - Trắng Ngọc',
    description: 'Đi ít, nội thất mới, hỗ trợ sang tên nhanh.',
    imageUrl: '/turborepo-light.svg',
    statusPost: 'approved',
    priceVnd: 465000000,
    wardId: 'ward-02',
    addressText: 'Cầu Giấy, Hà Nội',
    createdAt: '2024-09-20',
    updatedAt: '2025-02-10',

    type: 'ev',
    location: 'Hà Nội',
    thumbnail: '/turborepo-light.svg',

    brandId: 'vinfast',
    brandName: 'VinFast',
    modelId: 'vf-5',
    modelName: 'VF 5',
    trimId: 'plus',
    trimName: 'Plus',
    manufactureYear: 2023,
    bodyStyle: 'Hatchback',
    origin: 'noi_dia',
    colorName: 'Trắng',
    seats: 5,
    condition: 'used',
    licensePlate: '30G-678.90',
    odoKm: 12000,
    batteryCapacityKWh: 37,
    status: 'reserved',
  },
];

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
