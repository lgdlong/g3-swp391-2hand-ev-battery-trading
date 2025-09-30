'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { getCarPostsWithQuery, getBikePostsWithQuery } from '@/lib/api/postApi';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

type SortKey = 'newest' | 'price-asc' | 'price-desc';

// Format VND currency
const formatVnd = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(numAmount);
};

// Helper function to safely display flexible field values
const displayValue = (value: string | number | object | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object') return JSON.stringify(value);
  return 'N/A';
};

// Helper function to safely convert to string for toLowerCase operations
const toStringValue = (value: string | number | object | null | undefined): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return JSON.stringify(value);
};

function EvPostsContent() {
  const [sort, setSort] = useState<SortKey>('newest');
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [brand, setBrand] = useState('');
  const [min, setMin] = useState<number | null>(null);
  const [max, setMax] = useState<number | null>(null);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setLocation(searchParams.get('loc') || '');
    setBrand(searchParams.get('brand') || '');
    const minParam = searchParams.get('min');
    const maxParam = searchParams.get('max');
    setMin(minParam ? Number(minParam) : null);
    setMax(maxParam ? Number(maxParam) : null);
  }, [searchParams]);

  // Fetch car posts from API
  const {
    data: carPosts = [],
    isLoading: isLoadingCars,
    error: carError,
  } = useQuery({
    queryKey: ['carPosts', query, location, brand, min, max, sort],
    queryFn: async () => {
      const queryParams = {
        q: query || undefined,
        offset: 0,
        limit: 50,
        order: (sort === 'newest' ? 'DESC' : sort === 'price-asc' ? 'ASC' : 'DESC') as
          | 'ASC'
          | 'DESC',
        sort: sort === 'newest' ? 'createdAt' : 'priceVnd',
        status: 'APPROVED' as const,
      };
      return await getCarPostsWithQuery(queryParams);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch bike posts from API
  const {
    data: bikePosts = [],
    isLoading: isLoadingBikes,
    error: bikeError,
  } = useQuery({
    queryKey: ['bikePosts', query, location, brand, min, max, sort],
    queryFn: async () => {
      const queryParams = {
        q: query || undefined,
        offset: 0,
        limit: 50,
        order: (sort === 'newest' ? 'DESC' : sort === 'price-asc' ? 'ASC' : 'DESC') as
          | 'ASC'
          | 'DESC',
        sort: sort === 'newest' ? 'createdAt' : 'priceVnd',
        status: 'APPROVED' as const,
      };
      return await getBikePostsWithQuery(queryParams);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Combine loading states and errors
  const isLoading = isLoadingCars || isLoadingBikes;

  // Handle API errors
  useEffect(() => {
    if (carError) {
      toast.error('Không thể tải danh sách xe điện. Vui lòng thử lại.');
      console.error('Error fetching car posts:', carError);
    }
    if (bikeError) {
      toast.error('Không thể tải danh sách xe máy điện. Vui lòng thử lại.');
      console.error('Error fetching bike posts:', bikeError);
    }
  }, [carError, bikeError]);

  // Combine car and bike posts
  const allEvPosts = useMemo(() => {
    return [...carPosts, ...bikePosts];
  }, [carPosts, bikePosts]);

  // Client-side filtering (additional filtering beyond API)
  const filtered = useMemo(() => {
    let data = [...allEvPosts];

    // Additional client-side filtering for location and brand
    if (location) {
      data = data.filter(
        (p) =>
          toStringValue(p.provinceNameCached).toLowerCase().includes(location.toLowerCase()) ||
          toStringValue(p.districtNameCached).toLowerCase().includes(location.toLowerCase()) ||
          toStringValue(p.wardNameCached).toLowerCase().includes(location.toLowerCase()) ||
          toStringValue(p.addressTextCached).toLowerCase().includes(location.toLowerCase()),
      );
    }

    if (brand) {
      data = data.filter((p) => p.title.toLowerCase().includes(brand.toLowerCase()));
    }

    // Price filtering (client-side for more precise control)
    if (min !== null) {
      data = data.filter((p) => parseFloat(p.priceVnd) >= min);
    }
    if (max !== null) {
      data = data.filter((p) => parseFloat(p.priceVnd) <= max);
    }

    return data;
  }, [allEvPosts, location, brand, min, max]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Đã duyệt';
      case 'PENDING':
        return 'Chờ duyệt';
      case 'DRAFT':
        return 'Nháp';
      case 'REJECTED':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const Badge = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className || ''}`}
    >
      {children}
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Xe điện (EV)</h1>
          <p className="text-muted-foreground">Khám phá các mẫu xe điện chất lượng</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-t-lg"></div>
              <div className="p-6 bg-white rounded-b-lg shadow-lg">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Xe điện (EV)</h1>
            <p className="text-muted-foreground">Khám phá các mẫu xe điện chất lượng</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Sắp xếp:</span>
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#048C73] focus:border-[#048C73] transition-all"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              disabled={isLoading}
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá thấp → cao</option>
              <option value="price-desc">Giá cao → thấp</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Tìm thấy {filtered.length} kết quả</span>
          <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
          <span>Cập nhật liên tục</span>
          {isLoading && (
            <>
              <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
              <span>Đang tải...</span>
            </>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy kết quả</h3>
          <p className="text-gray-500">Thử thay đổi bộ lọc tìm kiếm của bạn</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item) => {
            const location =
              [
                displayValue(item.provinceNameCached),
                displayValue(item.districtNameCached),
                displayValue(item.wardNameCached),
              ]
                .filter((val) => val !== 'N/A')
                .join(', ') ||
              displayValue(item.addressTextCached) ||
              'Không rõ';

            return (
              <Link key={item.id} href={`/posts/ev/${item.id}`} className="group">
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1 bg-white">
                  <CardContent className="p-0">
                    <div className="relative h-48 w-full bg-gradient-to-br from-slate-50 to-slate-100">
                      <Image
                        src={
                          (typeof item.images?.[0] === 'string' ? item.images[0] : null) ||
                          '/asset/phu-tung-o-to-27.png'
                        }
                        alt={item.title}
                        fill
                        sizes="(max-width:768px) 100vw, 33vw"
                        className="object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute left-4 top-4">
                        <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-0 shadow-lg">
                          {item.carDetails ? 'Ô tô điện' : 'Xe máy điện'}
                        </Badge>
                      </div>
                      <div className="absolute right-4 top-4">
                        <Badge className={`border shadow-sm ${getStatusColor(item.status)}`}>
                          {getStatusText(item.status)}
                        </Badge>
                      </div>
                      {(item.carDetails?.origin === 'NOI_DIA' ||
                        item.bikeDetails?.origin === 'NOI_DIA') && (
                        <div className="absolute right-4 bottom-4">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            Nội địa
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-[#048C73] transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {displayValue(
                              item.carDetails?.manufacture_year ||
                                item.bikeDetails?.manufacture_year,
                            )}{' '}
                            • {location}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          {displayValue(
                            item.carDetails?.battery_capacity_kwh ||
                              item.bikeDetails?.battery_capacity_kwh,
                          )}{' '}
                          kWh
                        </div>
                        <div className="flex items-center gap-1">
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {(
                            item.carDetails?.odo_km || item.bikeDetails?.odo_km
                          )?.toLocaleString() || 'N/A'}{' '}
                          km
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-[#048C73]">
                          {formatVnd(item.priceVnd)}
                        </div>
                        {item.isNegotiable && (
                          <div className="text-xs text-gray-500">Có thể thương lượng</div>
                        )}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg
                            className="h-5 w-5 text-[#048C73]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function EvPostsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <EvPostsContent />
    </Suspense>
  );
}
