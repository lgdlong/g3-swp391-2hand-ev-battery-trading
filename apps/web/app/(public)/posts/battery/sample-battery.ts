export type BatteryPost = {
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
  type: 'battery';
  location: string;
  thumbnail?: string;

  // battery details
  brand?: string;
  batteryCapacityKWh: number;
  year: number;
  status: 'available' | 'sold' | 'reserved';
  cyclesUsed?: number; // số lần đã sạc
  healthPercent?: number; // % tuổi thọ còn lại
};

export const sampleBatteryPosts: BatteryPost[] = [
  {
    id: 'bat-101',
    sellerId: 'seller-300',
    title: 'Pack pin EV 60kWh - còn 90% SOH',
    description: 'Pack tháo xe, đã test dung lượng, phù hợp thay thế hoặc dự phòng.',
    imageUrl: '/vercel.svg',
    statusPost: 'approved',
    priceVnd: 95000000,
    wardId: 'ward-03',
    addressText: 'Hải Châu, Đà Nẵng',
    createdAt: '2024-07-15',
    updatedAt: '2025-01-20',

    type: 'battery',
    location: 'Đà Nẵng',
    thumbnail: '/vercel.svg',

    brand: 'CATL',
    batteryCapacityKWh: 60,
    year: 2021,
    status: 'available',
    cyclesUsed: 320,
    healthPercent: 90,
  },
  {
    id: 'bat-102',
    sellerId: 'seller-400',
    title: 'Module pin LFP 20kWh - đã kiểm định',
    description: 'Module LFP độ bền cao, đã kiểm định nội trở, thích hợp lưu trữ.',
    imageUrl: '/next.svg',
    statusPost: 'approved',
    priceVnd: 35000000,
    wardId: 'ward-04',
    addressText: 'Ninh Kiều, Cần Thơ',
    createdAt: '2024-10-01',
    updatedAt: '2025-02-12',

    type: 'battery',
    location: 'Cần Thơ',
    thumbnail: '/next.svg',

    brand: 'EVE Energy',
    batteryCapacityKWh: 20,
    year: 2020,
    status: 'sold',
    cyclesUsed: 800,
    healthPercent: 85,
  },
];

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
